import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

const EVO_API_URL = "http://localhost:8080";
const EVO_API_KEY = "@Ed82922545";
const INSTANCE_NAME = "bot_vencedor";

const evoHeaders = {
  "apikey": EVO_API_KEY,
  "Content-Type": "application/json"
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getMediaBase64 = (mediaUrl: string): { base64: string; mimeType: string } | null => {
  if (!mediaUrl) return null;

  if (mediaUrl.includes('/uploads/')) {
    const filename = mediaUrl.split('/uploads/').pop();
    if (filename) {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        const ext = path.extname(filePath).toLowerCase();

        let mimeType = 'audio/mp3';
        if (ext === '.ogg') mimeType = 'audio/ogg';
        if (ext === '.wav') mimeType = 'audio/wav';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        if (ext === '.mp4') mimeType = 'video/mp4';

        return { base64, mimeType };
      }
    }
  }
  return null;
};

export class FlowEngine {
  
  static async processNextNode(phone: string, flowId: string, currentNodeId?: string, userReplyText?: string) {
    try {
      const flow = await prisma.flow.findUnique({
        where: { id: flowId },
        include: { nodes: true, edges: true }
      });

      if (!flow) {
        console.error(`[FlowEngine] Fluxo ${flowId} não encontrado.`);
        return;
      }

      let targetNode;

      if (!currentNodeId) {
        targetNode = flow.nodes.find(n => n.type === 'trigger' || n.data?.type === 'trigger');
      } else {
        const sourceNode = flow.nodes.find(n => n.id === currentNodeId);
        const sourceNodeType = (sourceNode?.data as any)?.type || sourceNode?.type;

        if (sourceNodeType === 'buttons' && userReplyText) {
          const buttonsList: string[] = (sourceNode?.data as any)?.buttons || ['Opção 1', 'Opção 2'];
          const cleanReply = userReplyText.trim().toUpperCase();

          let selectedIndex = -1;

          if (cleanReply === '1' || cleanReply.includes(buttonsList[0]?.toUpperCase())) {
            selectedIndex = 0;
          } else if (cleanReply === '2' || (buttonsList[1] && cleanReply.includes(buttonsList[1]?.toUpperCase()))) {
            selectedIndex = 1;
          }

          if (selectedIndex !== -1) {
            const selectedHandleId = `btn_handle_${selectedIndex}`;
            const targetEdge = flow.edges.find(e => e.sourceNodeId === currentNodeId && e.sourceHandle === selectedHandleId);
            
            if (targetEdge) {
              targetNode = flow.nodes.find(n => n.id === targetEdge.targetNodeId);
            }
          }

          if (!targetNode) {
            const defaultEdge = flow.edges.find(e => e.sourceNodeId === currentNodeId);
            if (defaultEdge) {
              targetNode = flow.nodes.find(n => n.id === defaultEdge.targetNodeId);
            }
          }
        } else {
          const edge = flow.edges.find(e => e.sourceNodeId === currentNodeId);
          if (edge) {
            targetNode = flow.nodes.find(n => n.id === edge.targetNodeId);
          }
        }
      }

      if (!targetNode) {
        console.log(`[FlowEngine] ✅ Fim do fluxo para o telefone ${phone}. Sem mais conexões.`);
        await prisma.contactSession.deleteMany({ where: { phone } });
        return;
      }

      console.log(`[FlowEngine] Executando Nó: ${targetNode.type || targetNode.data?.type} | Label: ${targetNode.data?.label}`);

      // 🔥 NOVIDADE: INCREMENTA O CONTADOR DE DISPAROS DO NÓ NO SUPABASE
      await prisma.node.update({
        where: { id: targetNode.id },
        data: { executionCount: { increment: 1 } }
      });

      const nodeData = targetNode.data as any;
      const nodeType = nodeData?.type || targetNode.type; 

      if (nodeType === 'text' && nodeData?.text) {
        await this.sendTextMessage(phone, nodeData.text);
      } 
      else if (nodeType === 'buttons' && nodeData?.text) {
        await this.sendButtonsMenu(phone, nodeData.text, nodeData.buttons || ['Opção 1', 'Opção 2']);
      }
      else if (nodeType === 'audio' && nodeData?.mediaUrl) {
        if (nodeData.ptt) {
          await this.sendAudioPTT(phone, nodeData.mediaUrl);
        } else {
          await this.sendMediaMessage(phone, nodeData.mediaUrl, 'audio');
        }
      } 
      else if ((nodeType === 'image' || nodeType === 'video') && nodeData?.mediaUrl) {
        await this.sendMediaMessage(phone, nodeData.mediaUrl, nodeType, nodeData.text);
      } 
      else if (nodeType === 'delay' && nodeData?.delayValue) {
        const delayMs = nodeData.delayUnit === 'minutes' 
          ? nodeData.delayValue * 60 * 1000 
          : nodeData.delayValue * 1000;

        console.log(`[FlowEngine] ⏱️ Smart Delay ativado: Aguardando ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }

      const requiresReply = nodeData?.waitForReply || nodeType === 'buttons';

      if (requiresReply) {
        console.log(`⏸️ [FLOW PAUSED] O nó atual exige resposta do cliente. Aguardando mensagem do número ${phone}...`);
        await prisma.contactSession.upsert({
          where: { phone },
          update: {
            flowId,
            currentNodeId: targetNode.id,
            status: 'WAITING_REPLY',
            lastInteraction: new Date()
          },
          create: {
            phone,
            flowId,
            currentNodeId: targetNode.id,
            status: 'WAITING_REPLY'
          }
        });
        return;
      }

      await prisma.contactSession.upsert({
        where: { phone },
        update: {
          flowId,
          currentNodeId: targetNode.id,
          status: 'ACTIVE',
          lastInteraction: new Date()
        },
        create: {
          phone,
          flowId,
          currentNodeId: targetNode.id,
          status: 'ACTIVE'
        }
      });

      await this.processNextNode(phone, flowId, targetNode.id);

    } catch (error) {
      console.error(`[FlowEngine] ❌ Erro ao processar nó para ${phone}:`, error);
    }
  }

  // =========================================================
  // INTEGRAÇÕES COM A EVOLUTION API
  // =========================================================

  private static async sendTextMessage(phone: string, text: string) {
    try {
      await axios.post(`${EVO_API_URL}/message/sendText/${INSTANCE_NAME}`, {
        number: phone,
        text: text
      }, { headers: evoHeaders });
      console.log(`📲 [WHATSAPP OUT] Texto enviado para ${phone}`);
    } catch (error: any) {
      console.error(`❌ Erro ao enviar texto:`, error?.response?.data || error.message);
    }
  }

  private static async sendButtonsMenu(phone: string, text: string, buttons: string[]) {
    try {
      const formattedText = `${text}\n\n` + buttons.map((btn, idx) => `*${idx + 1}️⃣* ${btn}`).join('\n') + `\n\n_Responda com o número desejado (ex: 1)_`;

      await axios.post(`${EVO_API_URL}/message/sendText/${INSTANCE_NAME}`, {
        number: phone,
        text: formattedText
      }, { headers: evoHeaders });
      console.log(`🔘 [WHATSAPP OUT] Menu interativo enviado com sucesso para ${phone}`);
    } catch (error: any) {
      console.error(`❌ Erro ao enviar menu:`, error?.response?.data || error.message);
    }
  }

  private static async sendAudioPTT(phone: string, mediaUrl: string) {
    try {
      const mediaData = getMediaBase64(mediaUrl);
      const audioContent = mediaData ? mediaData.base64 : mediaUrl;

      await axios.post(`${EVO_API_URL}/message/sendWhatsAppAudio/${INSTANCE_NAME}`, {
        number: phone,
        audio: audioContent,
        encoding: true
      }, { headers: evoHeaders });
      console.log(`🎙️ [WHATSAPP OUT] Áudio PTT enviado com sucesso para ${phone}`);
    } catch (error: any) {
      console.error(`❌ Erro ao enviar Áudio PTT:`, error?.response?.data || error.message);
    }
  }

  private static async sendMediaMessage(phone: string, mediaUrl: string, mediaType: string, caption?: string) {
    try {
      const mediaData = getMediaBase64(mediaUrl);
      const mediaContent = mediaData ? mediaData.base64 : mediaUrl;

      await axios.post(`${EVO_API_URL}/message/sendMedia/${INSTANCE_NAME}`, {
        number: phone,
        mediatype: mediaType,
        media: mediaContent,
        caption: caption || ""
      }, { headers: evoHeaders });
      console.log(`🖼️ [WHATSAPP OUT] Mídia (${mediaType}) enviada com sucesso para ${phone}`);
    } catch (error: any) {
      console.error(`❌ Erro ao enviar Mídia:`, error?.response?.data || error.message);
    }
  }
}