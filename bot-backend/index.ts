import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { FlowEngine } from './flowEngine';

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ [Aviso] JSON inválido recebido.');
    return res.status(400).json({ status: 400, message: 'JSON Inválido' });
  }
  next(err);
});

// --- ROTAS ---

app.get('/', (req: Request, res: Response) => {
  res.send('🤖 Backend do Bot Conversa está online na Nuvem!');
});

app.get('/api/flows', async (req: Request, res: Response) => {
  try {
    const flows = await prisma.flow.findMany({
      include: {
        _count: {
          select: { nodes: true, edges: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, flows });
  } catch (error) {
    console.error('❌ Erro ao buscar fluxos:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar fluxos.' });
  }
});

app.get('/api/flows/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const flow = await prisma.flow.findUnique({
      where: { id },
      include: { nodes: true, edges: true }
    });
    if (!flow) {
      return res.status(404).json({ success: false, error: 'Fluxo não encontrado.' });
    }
    return res.status(200).json({ success: true, flow });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar o fluxo.' });
  }
});

app.post('/api/flows', async (req: Request, res: Response) => {
  try {
    const { id, name, description, nodes, edges } = req.body;

    if (id) {
      await prisma.node.deleteMany({ where: { flowId: String(id) } });
      await prisma.edge.deleteMany({ where: { flowId: String(id) } });

      const updatedFlow = await prisma.flow.update({
        where: { id: String(id) },
        data: {
          name,
          description,
          nodes: {
            create: nodes.map((n: any) => ({
              id: `${id}-${n.id}`,
              type: n.type,
              positionX: n.positionX,
              positionY: n.positionY,
              data: n.data,
            })),
          },
          edges: {
            create: edges.map((e: any) => ({
              id: `${id}-${e.id}`,
              sourceNodeId: `${id}-${e.sourceNodeId}`,
              targetNodeId: `${id}-${e.targetNodeId}`,
              sourceHandle: e.sourceHandle ? String(e.sourceHandle) : null,
            })),
          },
        },
      });
      return res.status(200).json({ success: true, message: 'Fluxo atualizado!', flow: updatedFlow });
    } else {
      const createdFlow = await prisma.flow.create({
        data: {
          name,
          description,
        }
      });

      const newFlowId = createdFlow.id;
      const nodeMapping: { [key: string]: string } = {};

      const preparedNodes = nodes.map((n: any) => {
        const uniqueNodeId = `${newFlowId}-${n.id}-${Math.random().toString(36).substring(2, 7)}`;
        nodeMapping[n.id] = uniqueNodeId;
        return {
          id: uniqueNodeId,
          type: n.type,
          positionX: n.positionX,
          positionY: n.positionY,
          data: n.data,
          flowId: newFlowId
        };
      });

      const preparedEdges = edges.map((e: any) => ({
        id: `${newFlowId}-${e.id}-${Math.random().toString(36).substring(2, 7)}`,
        sourceNodeId: nodeMapping[e.sourceNodeId] || e.sourceNodeId,
        targetNodeId: nodeMapping[e.targetNodeId] || e.targetNodeId,
        sourceHandle: e.sourceHandle ? String(e.sourceHandle) : null,
        flowId: newFlowId
      }));

      await prisma.node.createMany({ data: preparedNodes });
      await prisma.edge.createMany({ data: preparedEdges });

      return res.status(201).json({ success: true, message: 'Novo fluxo criado!', flow: createdFlow });
    }
  } catch (error) {
    console.error('❌ Erro ao salvar fluxo:', error);
    return res.status(500).json({ success: false, error: 'Erro ao salvar o fluxo.' });
  }
});

app.delete('/api/flows/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.flow.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Fluxo excluído.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao excluir o fluxo.' });
  }
});

app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.status(200).json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao processar upload.' });
  }
});

// Rota para resetar todas as sessões ativas e liberar contatos travados
app.get('/api/reset-sessions', async (req: Request, res: Response) => {
  try {
    const deleted = await prisma.contactSession.deleteMany({});
    console.log(`🧹 [LIMPEZA] ${deleted.count} sessões de conversa foram resetadas!`);
    return res.status(200).json({ 
      success: true, 
      message: `${deleted.count} sessões ativas foram apagadas com sucesso! Todos os números foram liberados.` 
    });
  } catch (error) {
    console.error('Erro ao resetar sessões:', error);
    return res.status(500).json({ success: false, error: 'Erro ao resetar sessões no banco.' });
  }
});

app.post('/api/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body?.event === 'messages.upsert' && body?.data) {
      const messageData = body.data;

      // 1. Ignora mensagens enviadas pelo próprio robô
      if (messageData.key?.fromMe) {
        return res.status(200).json({ status: 'ignored_from_me' });
      }

      // 2. Trava de segurança para grupos ou canais
      const remoteJid = messageData.key?.remoteJid || '';
      if (remoteJid.includes('@g.us') || remoteJid.includes('@newsletter')) {
        return res.status(200).json({ status: 'ignored_group_or_channel' });
      }

      // 3. Extração Inteligente do Número Real (Resolve problema do LID e sufixos)
      // Prioriza remoteJidAlt, depois sender e por fim remoteJid
      let rawPhone = messageData.key?.remoteJidAlt || body.sender || messageData.key?.remoteJid || '';
      
      // Limpa caracteres deixando apenas os números do telefone (ex: 554888790246)
      const phone = rawPhone.split('@')[0].split(':')[0].replace(/\D/g, '');

      if (!phone) {
        return res.status(200).json({ status: 'invalid_phone_extracted' });
      }

      // 4. Extração do Texto da Mensagem
      const msg = messageData.message;
      const textMessage =
        msg?.conversation ||
        msg?.extendedTextMessage?.text ||
        msg?.imageMessage?.caption ||
        msg?.videoMessage?.caption ||
        msg?.buttonsResponseMessage?.selectedButtonId ||
        msg?.buttonsResponseMessage?.selectedDisplayText ||
        msg?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        body?.data?.content ||
        '';

      const cleanText = textMessage.trim().toUpperCase();

      console.log(`\n📩 [WEBHOOK RECEBIDO] Cliente Real: ${phone} | Mensagem: "${cleanText}"`);

      if (cleanText) {
        // Busca se existe algum fluxo ativado por esta palavra-chave
        const flows = await prisma.flow.findMany({
          include: { nodes: true },
        });

        let matchedFlow = null;

        for (const flow of flows) {
          const triggerNode = flow.nodes.find(
            (n) => n.type === 'trigger' || (n.data as any)?.type === 'trigger'
          );
          const triggerKeyword = (triggerNode?.data as any)?.text?.trim().toUpperCase();

          if (triggerKeyword && cleanText.includes(triggerKeyword)) {
            matchedFlow = flow;
            break;
          }
        }

        // Se encontrou gatilho, inicia o fluxo para o telefone extraído
        if (matchedFlow) {
          console.log(`🚀 [GATILHO ATIVADO] Iniciando fluxo "${matchedFlow.name}" para o número ${phone}.`);
          await prisma.contactSession.deleteMany({ where: { phone } });
          FlowEngine.processNextNode(phone, matchedFlow.id);
          return res.status(200).json({ status: 'TRIGGER_STARTED' });
        }

        // Se o cliente já está em uma conversa ativa aguardando resposta
        const activeSession = await prisma.contactSession.findUnique({
          where: { phone }
        });

        if (activeSession && activeSession.status === 'WAITING_REPLY') {
          console.log(`▶️ [RETOMANDO FLUXO] Cliente ${phone} respondeu: "${cleanText}".`);
          FlowEngine.processNextNode(phone, activeSession.flowId, activeSession.currentNodeId, cleanText);
          return res.status(200).json({ status: 'RESUMED_FLOW' });
        }
      }
    }

    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error) {
    console.error('❌ Erro no Webhook:', error);
    return res.status(500).json({ error: 'Erro interno do webhook' });
  }
});

// Rota para automatizar a criação e checagem da instância
// Rota para automatizar a checagem, criação e envio do QR Code
app.get('/api/whatsapp/connect', async (req: Request, res: Response) => {
  const instanceName = process.env.INSTANCE_NAME || 'bot_oficial_v3';
  const evoUrl = process.env.EVOLUTION_API_URL || process.env.EVO_API_URL || 'https://my-botconversa.onrender.com';
  const apiKey = process.env.EVOLUTION_API_KEY || process.env.EVO_API_KEY || 'Ed82922545';

  const headers = {
    'apikey': apiKey,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Se o usuário solicitou logout
    if (req.query.logout === 'true') {
      await axios.delete(`${evoUrl}/instance/logout/${instanceName}`, { headers });
      return res.status(200).json({ success: true, message: 'Desconectado com sucesso' });
    }

    // 2. Tenta buscar a conexão atual da instância
    const statusRes = await axios.get(`${evoUrl}/instance/connectionState/${instanceName}`, { headers });
    
    if (statusRes.data?.instance?.state === 'open') {
      let ownerNumber = "Conectado";
      try {
        const fetchRes = await axios.get(`${evoUrl}/instance/fetchInstances?instanceName=${instanceName}`, { headers });
        if (fetchRes.data && fetchRes.data.length > 0) {
          const owner = fetchRes.data[0].ownerJid || fetchRes.data[0].instance?.ownerJid;
          if (owner) ownerNumber = owner.split('@')[0];
        }
      } catch (e) {}

      return res.status(200).json({ success: true, state: 'open', connected: true, owner: ownerNumber });
    }

    // 3. Se não estiver open, solicita o QR Code
    const qrRes = await axios.get(`${evoUrl}/instance/connect/${instanceName}`, { headers });
    return res.status(200).json({ 
      success: true, 
      state: 'connecting', 
      qrcode: qrRes.data?.base64 || qrRes.data?.qrcode?.base64 
    });

  } catch (error: any) {
    // 4. Se a instância não existir (404), cria ela automaticamente
    if (error?.response?.status === 404) {
      try {
        console.log(`🤖 Criando instância ${instanceName} automaticamente...`);
        await axios.post(`${evoUrl}/instance/create`, {
          instanceName: instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          rejectCall: false,
          groupsIgnore: true,
          alwaysOnline: true,
          readMessages: false,
          readStatus: false,
          syncFullHistory: false
        }, { headers });

        const qrRes = await axios.get(`${evoUrl}/instance/connect/${instanceName}`, { headers });
        return res.status(200).json({ 
          success: true, 
          state: 'connecting', 
          qrcode: qrRes.data?.base64 || qrRes.data?.qrcode?.base64 
        });

      } catch (createError: any) {
        return res.status(500).json({ success: false, error: 'Erro ao criar instância no WhatsApp.' });
      }
    }

    return res.status(500).json({ success: false, error: 'Erro ao conectar com a Evolution API.' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});