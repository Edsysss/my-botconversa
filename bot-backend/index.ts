import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { FlowEngine } from './FlowEngine';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

const app = express();

// Configuração completa do CORS para permitir que o Front-end faça requisições HTTP sem bloqueio
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Garante que a pasta 'uploads' existe no servidor
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve a pasta de uploads estaticamente
app.use('/uploads', express.static(uploadsDir));

// Configuração do Multer para upload de mídias
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

// Proteção contra JSON mal formatado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ [Aviso] JSON inválido recebido. Ignorando...');
    return res.status(400).json({ status: 400, message: 'JSON Inválido' });
  }
  next(err);
});

// --- ROTAS DO SERVIDO ---

app.get('/', (req, res) => {
  res.send('🤖 Backend do Bot Conversa está online e pronto!');
});

// 1. ROTA OBRIGATÓRIA DO DASHBOARD: Listar todos os fluxos
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
    console.error('❌ Erro ao buscar fluxos no Supabase:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar fluxos do banco.' });
  }
});

// 2. Buscar um fluxo específico por ID
app.get('/api/flows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const flow = await prisma.flow.findUnique({
      where: { id },
      include: { nodes: true, edges: true }
    });
    if (!flow) {
      return res.status(404).json({ success: false, error: 'Fluxo não encontrado.' });
    }
    return res.status(200).json({ success: true, flow });
  } catch (error) {
    console.error('❌ Erro ao buscar fluxo:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar o fluxo.' });
  }
});

// 3. Salvar / Criar / Atualizar Fluxo
app.post('/api/flows', async (req: Request, res: Response) => {
  try {
    const { id, name, description, nodes, edges } = req.body;

    // Se já tiver ID, atualiza o fluxo existente
    if (id) {
      await prisma.node.deleteMany({ where: { flowId: id } });
      await prisma.edge.deleteMany({ where: { flowId: id } });

      const updatedFlow = await prisma.flow.update({
        where: { id },
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
              sourceHandle: e.sourceHandle || null,
            })),
          },
        },
      });
      console.log(`💾 [FLUXO ATUALIZADO] ${name}`);
      return res.status(200).json({ success: true, message: 'Fluxo atualizado com sucesso!', flow: updatedFlow });
    } 
    // Se for um NOVO fluxo
    else {
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
        sourceHandle: e.sourceHandle || null,
        flowId: newFlowId
      }));

      await prisma.node.createMany({ data: preparedNodes });
      await prisma.edge.createMany({ data: preparedEdges });

      console.log(`✨ [NOVO FLUXO CRIADO] ${name}`);
      return res.status(201).json({ success: true, message: 'Novo fluxo criado com sucesso!', flow: createdFlow });
    }
  } catch (error) {
    console.error('❌ Erro ao salvar fluxo:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao salvar o fluxo.' });
  }
});

// 4. Excluir Fluxo do Supabase
app.delete('/api/flows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.flow.delete({ where: { id } });
    console.log(`🗑️ [FLUXO EXCLUÍDO] ID: ${id}`);
    return res.status(200).json({ success: true, message: 'Fluxo excluído com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao excluir fluxo:', error);
    return res.status(500).json({ success: false, error: 'Erro ao excluir o fluxo.' });
  }
});

// 5. Upload de Mídias Locais
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log(`📁 [UPLOAD REALIZADO] ${req.file.filename}`);
    return res.status(200).json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('❌ Erro no upload do arquivo:', error);
    return res.status(500).json({ success: false, error: 'Erro ao processar upload.' });
  }
});

// Webhook WhatsApp (MESSAGES_UPSERT)
app.post('/api/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body?.event === 'messages.upsert' && body?.data) {
      const messageData = body.data;

      if (messageData.key?.fromMe) {
        return res.status(200).json({ status: 'ignored_from_me' });
      }

      // Tenta pegar o número limpo (ignora sufixos @lid)
      const rawJid = messageData.key?.remoteJidAlt || messageData.key?.remoteJid || '';
      const phone = rawJid.split('@')[0];

      if (rawJid.includes('@lid') && !messageData.key?.remoteJidAlt) {
        return res.status(200).json({ status: 'ignored_lid_event' });
      }

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

      console.log(`\n📩 [WEBHOOK RECEBIDO] De: ${phone} | Mensagem extraída: "${cleanText}"`);

      if (cleanText) {
        // 1. Checa se a mensagem é um gatilho de algum fluxo
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

        if (matchedFlow) {
          console.log(`🚀 [GATILHO ATIVADO] Correspondência no fluxo "${matchedFlow.name}". Iniciando fluxo...`);
          await prisma.contactSession.deleteMany({ where: { phone } });
          FlowEngine.processNextNode(phone, matchedFlow.id);
          return res.status(200).json({ status: 'TRIGGER_STARTED' });
        }

        // 2. Checa se é resposta de uma sessão pausada
        const activeSession = await prisma.contactSession.findUnique({
          where: { phone }
        });

        if (activeSession && activeSession.status === 'WAITING_REPLY') {
          console.log(`▶️ [RETOMANDO FLUXO] Cliente ${phone} respondeu: "${cleanText}". Continuando...`);
          FlowEngine.processNextNode(phone, activeSession.flowId, activeSession.currentNodeId, cleanText);
          return res.status(200).json({ status: 'RESUMED_FLOW' });
        }

        console.log(`⚠️ Nenhuma palavra-chave ou sessão ativa correspondeu a "${cleanText}".`);
      }
    }

    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error) {
    console.error('❌ Erro no processamento do Webhook:', error);
    return res.status(500).json({ error: 'Erro interno do webhook' });
  }
});

// 7. Rota de Simulação Manual
app.post('/api/webhook/simulate', async (req: Request, res: Response) => {
  const { phone, flowName } = req.body;

  const flow = await prisma.flow.findFirst({
    where: { name: flowName || 'Funil de Vendas WhatsApp' },
  });

  if (!flow) {
    return res.status(404).json({ success: false, error: 'Fluxo não encontrado no Supabase.' });
  }

  FlowEngine.processNextNode(phone, flow.id);
  res.json({ success: true, message: `🚀 Fluxo iniciado em segundo plano para o número ${phone}!` });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso na porta http://localhost:${PORT}`);
});