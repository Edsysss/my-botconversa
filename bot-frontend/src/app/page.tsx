"use client";
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  BackgroundVariant,
  Handle,
  Position
} from 'reactflow';
import {
  MessageSquare, Mic, Clock, Save, X, Type, Smartphone, QrCode,
  CheckCircle2, Loader2, Image as ImageIcon, Film,
  Zap, Trash2, Plus, ArrowLeft, GitFork, Search, Edit3, ListOrdered, Copy, LogOut, Sparkles, AlertTriangle, Check
} from 'lucide-react';
import axios from 'axios';
import 'reactflow/dist/style.css';

const BACKEND_URL = "https://bot-backend-edsys.onrender.com";

// =========================================================================
// 1. COMPONENTE DE NÓ PERSONALIZADO
// =========================================================================
const FlowCardNode = ({ data, selected }: any) => {
  const isTrigger = data.type === 'trigger';
  const isDelay = data.type === 'delay';
  const isButtons = data.type === 'buttons';
  const buttonsList = data.buttons || ['Opção 1', 'Opção 2'];

  return (
    <div className={`relative min-w-[300px] bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-200 ${selected ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-emerald-500/10' : 'border-slate-800/80 hover:border-slate-700'
      }`}>
      {!isTrigger && (
        <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-slate-950 shadow-md" />
      )}

      <div className={`px-4 py-3 rounded-t-2xl flex items-center justify-between border-b ${isTrigger ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-emerald-500/20' :
          isDelay ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20' :
            isButtons ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border-purple-500/20' : 'bg-slate-800/40 border-slate-800'
        }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shadow-inner ${isTrigger ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              isDelay ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                isButtons ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  data.type === 'audio' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    data.type === 'image' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      data.type === 'video' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
            {isTrigger && <Zap size={16} />}
            {isDelay && <Clock size={16} />}
            {isButtons && <ListOrdered size={16} />}
            {data.type === 'text' && <MessageSquare size={16} />}
            {data.type === 'audio' && <Mic size={16} />}
            {data.type === 'image' && <ImageIcon size={16} />}
            {data.type === 'video' && <Film size={16} />}
          </div>
          <span className="font-semibold text-xs tracking-wide text-slate-200 uppercase">{data.label}</span>
        </div>

        {!isTrigger && (
          <button
            onClick={(e) => { e.stopPropagation(); if (data.onDelete) data.onDelete(); }}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Excluir Bloco"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="p-4 text-xs text-slate-400 flex flex-col gap-2.5">
        {isTrigger && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-400 font-mono w-fit">
            <Sparkles size={13} />
            <span>"{data.text}"</span>
          </div>
        )}

        {isDelay && (
          <span className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 font-medium w-fit">
            Aguardar {data.delayValue} {data.delayUnit === 'minutes' ? 'Minuto(s)' : 'Segundo(s)'}
          </span>
        )}

        {!isTrigger && !isDelay && (
          <p className="line-clamp-3 text-slate-300 leading-relaxed font-normal bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            {data.text || (data.mediaUrl ? '📎 Mídia Anexada' : 'Clique para configurar mensagem...')}
          </p>
        )}

        {isButtons && (
          <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-slate-800/80 pointer-events-auto">
            {buttonsList.map((btn: string, index: number) => (
              <div key={index} className="relative flex items-center justify-between bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700/60 text-xs font-semibold text-purple-300 shadow-sm">
                <span>🔘 {btn}</span>
                <Handle type="source" position={Position.Right} id={`btn_handle_${index}`} className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-slate-950 !-right-[7px]" />
              </div>
            ))}
          </div>
        )}

        {data.waitForReply && !isButtons && (
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit mt-1 flex items-center gap-1">
            ⏸️ Pausa: Aguarda Resposta do Lead
          </span>
        )}
      </div>

      {!isButtons && (
        <Handle type="source" position={Position.Right} className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-slate-950 shadow-md" />
      )}
    </div>
  );
};

const nodeTypes = { custom: FlowCardNode };

const defaultNodes: Node[] = [
  { id: 'node-gatilho', type: 'custom', position: { x: 50, y: 250 }, data: { label: 'Gatilho Principal', text: 'INICIAR', type: 'trigger' } },
  { id: 'node-msg-1', type: 'custom', position: { x: 450, y: 250 }, data: { label: 'Mensagem de Boas-Vindas', text: 'Olá! Seja bem-vindo. Como posso te ajudar hoje?', type: 'text' } }
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'node-gatilho', target: 'node-msg-1', animated: true, style: { stroke: '#10b981', strokeWidth: 2.5 } }
];

export default function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'builder'>('dashboard');
  const [flowsList, setFlowsList] = useState<any[]>([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('Novo Fluxo');
  const [flowDescription, setFlowDescription] = useState('');

  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [copiedNode, setCopiedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);

  const [nodeType, setNodeType] = useState('text');
  const [nodeText, setNodeText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isPtt, setIsPtt] = useState(true);
  const [waitForReply, setWaitForReply] = useState(false);
  const [delayValue, setDelayValue] = useState<number>(5);
  const [delayUnit, setDelayUnit] = useState<'seconds' | 'minutes'>('seconds');
  const [button1, setButton1] = useState('Opção 1');
  const [button2, setButton2] = useState('Opção 2');

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<string>("Sincronizando serviços...");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedNumber, setConnectedNumber] = useState<string>("");

  // ESTADOS DE TOAST E CONFIRMAÇÃO
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; action: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFlows = async () => {
    try {
      setLoadingFlows(true);
      const res = await axios.get(`${BACKEND_URL}/api/flows`);
      if (res.data?.success) setFlowsList(res.data.flows);
    } catch (error) {
      console.error("Erro ao carregar fluxos:", error);
    } finally {
      setLoadingFlows(false);
    }
  };

  useEffect(() => { fetchFlows(); }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'builder') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedNode && selectedNode.id !== 'node-gatilho') {
          setCopiedNode(selectedNode);
          showToast('Bloco copiado!', 'info');
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (copiedNode) {
          const newNode: Node = {
            ...copiedNode,
            id: `node-${Date.now()}`,
            position: { x: copiedNode.position.x + 40, y: copiedNode.position.y + 40 },
            selected: false,
          };
          setNodes((nds) => [...nds, newNode]);
          showToast('Bloco colado no canvas!', 'success');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, copiedNode, viewMode]);

  const handleDeleteNodeId = useCallback((idToDelete: string) => {
    if (idToDelete === 'node-gatilho') {
      showToast('O Gatilho principal não pode ser removido.', 'error');
      return;
    }
    setNodes((nds) => nds.filter((n) => n.id !== idToDelete));
    setEdges((eds) => eds.filter((e) => e.source !== idToDelete && e.target !== idToDelete));
    if (selectedNode?.id === idToDelete) setSelectedNode(null);
    showToast('Bloco removido!', 'info');
  }, [selectedNode]);

  const nodesWithActions = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: () => handleDeleteNodeId(node.id)
    }
  }));

  const handleCreateNewFlow = () => {
    setCurrentFlowId(null);
    setFlowName(`Novo Funil #${flowsList.length + 1}`);
    setFlowDescription('Funil de engajamento e conversão de leads...');
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setViewMode('builder');
  };

  const handleEditFlow = async (flowId: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/flows/${flowId}`);
      if (res.data?.success) {
        const flow = res.data.flow;
        setCurrentFlowId(flow.id);
        setFlowName(flow.name);
        setFlowDescription(flow.description || '');

        const formattedNodes: Node[] = flow.nodes.map((n: any) => ({
          id: n.id,
          type: 'custom',
          position: { x: n.positionX, y: n.positionY },
          data: n.data,
        }));

        const formattedEdges: Edge[] = flow.edges.map((e: any) => ({
          id: e.id,
          source: e.sourceNodeId,
          target: e.targetNodeId,
          sourceHandle: e.sourceHandle || null,
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2.5 }
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
        setViewMode('builder');
      }
    } catch (error) {
      showToast('Erro ao carregar dados do fluxo.', 'error');
    }
  };

  const handleDeleteFlow = (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Excluir Fluxo",
      message: "Tem certeza que deseja excluir permanentemente este fluxo? Esta ação não pode ser desfeita.",
      action: async () => {
        try {
          await axios.delete(`${BACKEND_URL}/api/flows/${flowId}`);
          showToast('Fluxo excluído com sucesso!', 'success');
          fetchFlows();
        } catch (error) {
          showToast('Erro ao excluir fluxo.', 'error');
        }
      }
    });
  };

  const handleDuplicateFlow = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSaving(true);
      const res = await axios.get(`${BACKEND_URL}/api/flows/${flowId}`);
      if (res.data?.success) {
        const flowToCopy = res.data.flow;
        const payload = {
          id: null,
          name: `${flowToCopy.name} (Cópia)`,
          description: flowToCopy.description,
          nodes: flowToCopy.nodes.map((n: any) => ({
            id: n.id,
            type: n.type || 'custom',
            positionX: n.positionX,
            positionY: n.positionY,
            data: n.data
          })),
          edges: flowToCopy.edges.map((e: any) => ({
            id: e.id,
            sourceNodeId: e.sourceNodeId,
            targetNodeId: e.targetNodeId,
            sourceHandle: e.sourceHandle || null
          }))
        };
        const createRes = await axios.post(`${BACKEND_URL}/api/flows`, payload);
        if (createRes.data?.success) {
          showToast('Fluxo duplicado com sucesso!', 'success');
          fetchFlows();
        }
      }
    } catch (error) {
      showToast('Erro ao duplicar fluxo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFlow = async () => {
    try {
      setSaving(true);
      const payload = {
        id: currentFlowId,
        name: flowName,
        description: flowDescription,
        nodes: nodes.map(n => ({ id: n.id, type: n.data.type, positionX: n.position.x, positionY: n.position.y, data: n.data })),
        edges: edges.map(e => ({ id: e.id, sourceNodeId: e.source, targetNodeId: e.target, sourceHandle: e.sourceHandle }))
      };
      const res = await axios.post(`${BACKEND_URL}/api/flows`, payload);
      if (res.data?.success && res.data?.flow) {
        setCurrentFlowId(res.data.flow.id);
      }
      showToast('🎉 Fluxo salvo com sucesso no servidor!', 'success');
      fetchFlows();
    } catch (error) {
      showToast('Erro ao salvar fluxo no servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = () => {
    setConfirmModal({
      isOpen: true,
      title: "Desconectar WhatsApp",
      message: "Deseja realmente desconectar este número? Você precisará ler o QR Code novamente para reativá-lo.",
      action: async () => {
        try {
          setConnStatus("Desconectando...");
          await axios.get(`${BACKEND_URL}/api/whatsapp/connect?logout=true`);
          setIsConnected(false);
          setConnectedNumber("");
          setQrCode(null);
          setConnStatus("Aparelho desconectado.");
          showToast('WhatsApp desconectado com sucesso.', 'info');
        } catch (error) {
          showToast('Erro ao desconectar dispositivo.', 'error');
        }
      }
    });
  };

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#10b981', strokeWidth: 2.5 } }, eds)), []);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeType(node.data.type || 'text');
    setNodeText(node.data.text || '');
    setMediaUrl(node.data.mediaUrl || '');
    setIsPtt(node.data.ptt ?? true);
    setWaitForReply(node.data.waitForReply ?? false);
    setDelayValue(node.data.delayValue ?? 5);
    setDelayUnit(node.data.delayUnit || 'seconds');
    setButton1(node.data.buttons?.[0] || 'Opção 1');
    setButton2(node.data.buttons?.[1] || 'Opção 2');
  };

  const handleUpdateNode = () => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          let updatedLabel = selectedNode.data.label;
          if (nodeType === 'text') updatedLabel = 'Mensagem de Texto';
          if (nodeType === 'buttons') updatedLabel = 'Menu com Botões';
          if (nodeType === 'image') updatedLabel = 'Imagem Anexada';
          if (nodeType === 'video') updatedLabel = 'Vídeo Anexado';
          if (nodeType === 'audio') updatedLabel = isPtt ? 'Áudio Gravado' : 'Áudio Encaminhado';
          if (nodeType === 'delay') updatedLabel = 'Smart Delay';

          return {
            ...n,
            data: {
              ...n.data,
              type: nodeType,
              label: updatedLabel,
              text: nodeText,
              mediaUrl,
              ptt: isPtt,
              waitForReply,
              delayValue,
              delayUnit,
              buttons: nodeType === 'buttons' ? [button1, button2] : undefined
            }
          };
        }
        return n;
      })
    );
    setSelectedNode(null);
    showToast('Bloco atualizado!', 'success');
  };

  const handleAddNode = (type: string) => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'custom',
      position: { x: 500, y: 300 },
      data: {
        type,
        label: type === 'delay' ? 'Smart Delay' : type === 'buttons' ? 'Menu de Botões' : type === 'audio' ? 'Áudio' : 'Nova Mensagem',
        text: '',
        mediaUrl: '',
        ptt: true,
        waitForReply: false,
        delayValue: 10,
        delayUnit: 'seconds',
        buttons: type === 'buttons' ? ['Opção 1', 'Opção 2'] : undefined
      },
    };
    setNodes((nds) => [...nds, newNode]);
    showToast('Novo bloco adicionado!', 'info');
  };

  // RADAR DE CONEXÃO COM TRATAMENTO DE COLD START
  useEffect(() => {
    let isMounted = true;
    let isChecking = false;

    const checkConnection = async () => {
      // Evita sobreposição de requisições se o servidor estiver lento
      if (isChecking) return;
      isChecking = true;

      try {
        // Removido o timeout de 10s para permitir que o servidor da Render acorde em paz
        const res = await axios.get(`${BACKEND_URL}/api/whatsapp/connect`);

        if (!isMounted) return;

        if (res.data?.connected || res.data?.state === "open") {
          setIsConnected(true);
          setConnStatus("WhatsApp Conectado!");
          setConnectedNumber(res.data?.owner || "Dispositivo Ativo");
          setQrCode(null);
        } else if (res.data?.qrcode) {
          setIsConnected(false);
          setConnectedNumber("");
          setQrCode(res.data.qrcode);
          setConnStatus("Aguardando leitura do QR Code...");
        } else {
          setIsConnected(false);
          setConnStatus("Gerando parâmetros de conexão...");
        }
      } catch (error: any) {
        if (!isMounted) return;
        setIsConnected(false);
        setConnectedNumber("");

        // Mostra o erro real que está vindo do servidor
        const errorMsg = error.response?.data?.details?.message || error.response?.data?.error || error.message;
        
        if (error.response?.status === 500 || error.response?.status === 502) {
          setConnStatus(`Iniciando instâncias... (${errorMsg})`);
        } else {
          setConnStatus("Erro de comunicação com o backend.");
        }
      } finally {
        isChecking = false;
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 8000); // Polling mais espaçado (8s)
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredFlows = flowsList.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (viewMode === 'dashboard') {
    return (
      <div className="w-screen h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col overflow-hidden selection:bg-emerald-500/30">
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <GitFork className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-100 flex items-center gap-2">
                FlowStudio SaaS <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">v3.0</span>
              </h1>
              <p className="text-xs text-slate-400">Motor de Automação Visual para WhatsApp</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200 border shadow-sm ${isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                }`}
            >
              {isConnected ? <CheckCircle2 size={15} /> : <Smartphone size={15} />}
              {isConnected ? `Instância Online (${connectedNumber})` : 'WhatsApp Desconectado'}
            </button>
            <button
              onClick={handleCreateNewFlow}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus size={16} /> Criar Novo Funil
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between mb-8 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar funil por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner"
              />
            </div>
            <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
              Fluxos Ativos: <span className="text-emerald-400 font-bold">{flowsList.length}</span>
            </div>
          </div>

          {loadingFlows ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <span className="text-xs text-slate-400 font-medium">Carregando funis da nuvem...</span>
            </div>
          ) : filteredFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30">
              <div className="p-4 bg-slate-800/50 rounded-2xl mb-3 border border-slate-700/50">
                <GitFork className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-semibold text-sm">Nenhum funil encontrado</p>
              <p className="text-xs text-slate-500 mt-1">Crie sequências automatizadas para converter seus leads.</p>
              <button
                onClick={handleCreateNewFlow}
                className="mt-5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1.5"
              >
                + Criar primeiro fluxo agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlows.map((flow) => (
                <div
                  key={flow.id}
                  onClick={() => handleEditFlow(flow.id)}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/5 group cursor-pointer relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                        <Zap size={18} />
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => handleDuplicateFlow(flow.id, e)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Duplicar Funil"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFlow(flow.id, e)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Excluir Funil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base mb-1.5 group-hover:text-emerald-400 transition-all">{flow.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-6">{flow.description || 'Sem descrição cadastrada.'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-500">
                    <span className="font-mono text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/50 text-slate-300">
                      {flow._count?.nodes || 0} Blocos
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold group-hover:translate-x-1 transition-all">
                      Abrir Editor <Edit3 size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DE CONEXÃO COM WHATSAPP */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>

              <div className="text-center mt-2">
                <h3 className="font-bold text-lg text-slate-100">WhatsApp Conexão Instantânea</h3>
                <p className="text-xs text-slate-400 mt-1">{connStatus}</p>
              </div>

              <div className={`w-64 ${isConnected ? 'h-auto py-6' : 'h-64'} bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner`}>
                {isConnected ? (
                  <div className="flex flex-col items-center justify-center w-full gap-4 text-emerald-400 px-4">
                    <CheckCircle2 size={52} className="text-emerald-400 animate-pulse" />
                    <div className="text-center">
                      <span className="font-bold text-sm block text-slate-100">Instância Conectada!</span>
                      <span className="text-xs text-slate-400 block mt-1">Número: {connectedNumber}</span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="mt-2 flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <LogOut size={14} /> Desconectar Aparelho
                    </button>
                  </div>
                ) : qrCode ? (
                  <div className="relative w-full h-full p-3 flex flex-col items-center justify-center">
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <span className="text-xs">Iniciando instância...</span>
                  </div>
                )}
              </div>

              {!isConnected && (
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Abra o WhatsApp no celular &gt; Aparelhos conectados &gt; Conectar um aparelho.
                </p>
              )}
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO */}
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 relative">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-100">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>
              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmModal.action();
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST FLUTUANTE */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400' :
              toast.type === 'error' ? 'bg-slate-900/90 border-red-500/30 text-red-400' : 'bg-slate-900/90 border-blue-500/30 text-blue-400'
            }`}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertTriangle size={16} />}
            {toast.type === 'info' && <Sparkles size={16} />}
            <span className="text-xs font-semibold text-slate-100">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 font-sans antialiased overflow-hidden selection:bg-emerald-500/30">
      {/* Canvas Header */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setViewMode('dashboard'); fetchFlows(); }}
            className="p-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl transition-all border border-slate-700/50"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="bg-transparent font-bold text-base text-slate-100 outline-none border-b border-transparent hover:border-slate-700 focus:border-emerald-500 transition-all"
            />
            <span className="text-[11px] text-slate-400">Edição em Tempo Real • Canvas ReactFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all border shadow-sm ${isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
              }`}
          >
            {isConnected ? <CheckCircle2 size={15} /> : <Smartphone size={15} />}
            {isConnected ? `Conectado: ${connectedNumber}` : 'WhatsApp Desconectado'}
          </button>
          <button
            onClick={handleSaveFlow}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 border-0 active:scale-95 cursor-pointer"
          >
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Funil'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800/80 p-4 flex flex-col gap-2.5 z-10">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Componentes de Fluxo</h2>
          <button onClick={() => handleAddNode('text')} className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-200 text-xs font-semibold border border-slate-700/40 transition-all hover:border-slate-600 shadow-sm"><MessageSquare size={16} className="text-emerald-400" /> Texto</button>
          <button onClick={() => handleAddNode('buttons')} className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-200 text-xs font-semibold border border-slate-700/40 transition-all hover:border-slate-600 shadow-sm"><ListOrdered size={16} className="text-purple-400" /> Botões Interativos</button>
          <button onClick={() => handleAddNode('image')} className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-200 text-xs font-semibold border border-slate-700/40 transition-all hover:border-slate-600 shadow-sm"><ImageIcon size={16} className="text-blue-400" /> Imagem</button>
          <button onClick={() => handleAddNode('audio')} className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-200 text-xs font-semibold border border-slate-700/40 transition-all hover:border-slate-600 shadow-sm"><Mic size={16} className="text-pink-400" /> Áudio PTT</button>
          <button onClick={() => handleAddNode('delay')} className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-200 text-xs font-semibold border border-slate-700/40 transition-all hover:border-slate-600 shadow-sm"><Clock size={16} className="text-amber-400" /> Smart Delay</button>
        </aside>

        <main className="flex-1 relative bg-slate-950 w-full h-[calc(100vh-64px)]">
          <ReactFlow
            nodes={nodesWithActions}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            connectionRadius={150}
            snapToGrid={true}
            snapGrid={[20, 20]}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background color="#334155" gap={20} size={1.2} variant={BackgroundVariant.Dots} />
            <Controls className="bg-slate-900 border-slate-800 fill-slate-300" />
            <MiniMap className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden" maskColor="rgba(15, 23, 42, 0.8)" />
          </ReactFlow>
        </main>

        <aside className={`w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/80 p-6 flex flex-col justify-between z-20 absolute right-0 top-0 h-full shadow-2xl transition-all duration-300 ease-in-out ${selectedNode ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col gap-5 overflow-y-auto pb-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2"><Type className="w-4 h-4 text-emerald-400" /><h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Propriedades do Bloco</h3></div>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100"><X size={18} /></button>
            </div>

            {nodeType === 'trigger' && (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Palavra Chave Gatilho</label>
                <input type="text" value={nodeText} onChange={(e) => setNodeText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-emerald-500 outline-none" />
              </div>
            )}

            {nodeType !== 'delay' && nodeType !== 'trigger' && (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conteúdo do Texto</label>
                <textarea rows={4} value={nodeText} onChange={(e) => setNodeText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-emerald-500 outline-none resize-none" />
              </div>
            )}

            {(nodeType === 'image' || nodeType === 'video' || nodeType === 'audio') && (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">URL do Arquivo / Mídia</label>
                <input type="text" placeholder="https://..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-emerald-500 outline-none" />
              </div>
            )}

            {nodeType !== 'delay' && nodeType !== 'trigger' && nodeType !== 'buttons' && (
              <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Aguardar Resposta do Lead</span>
                <input type="checkbox" checked={waitForReply} onChange={(e) => setWaitForReply(e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded" />
              </div>
            )}

            {nodeType === 'buttons' && (
              <div className="flex flex-col gap-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Opções do Menu</label>
                <input type="text" value={button1} onChange={(e) => setButton1(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100" />
                <input type="text" value={button2} onChange={(e) => setButton2(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100" />
              </div>
            )}

            {nodeType === 'delay' && (
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={delayValue} onChange={(e) => setDelayValue(Number(e.target.value))} className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100" />
                <select value={delayUnit} onChange={(e) => setDelayUnit(e.target.value as 'seconds' | 'minutes')} className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100">
                  <option value="seconds">Segundos</option>
                  <option value="minutes">Minutos</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button onClick={handleUpdateNode} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20">Aplicar Alterações</button>
          </div>
        </aside>

        {/* MODAL DE CONEXÃO NO CANVAS */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>

              <div className="text-center mt-2">
                <h3 className="font-bold text-lg text-slate-100">WhatsApp Conexão Instantânea</h3>
                <p className="text-xs text-slate-400 mt-1">{connStatus}</p>
              </div>

              <div className={`w-64 ${isConnected ? 'h-auto py-6' : 'h-64'} bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner`}>
                {isConnected ? (
                  <div className="flex flex-col items-center justify-center w-full gap-4 text-emerald-400 px-4">
                    <CheckCircle2 size={52} className="text-emerald-400 animate-pulse" />
                    <div className="text-center">
                      <span className="font-bold text-sm block text-slate-100">Instância Conectada!</span>
                      <span className="text-xs text-slate-400 block mt-1">Número: {connectedNumber}</span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="mt-2 flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <LogOut size={14} /> Desconectar Aparelho
                    </button>
                  </div>
                ) : qrCode ? (
                  <div className="relative w-full h-full p-3 flex flex-col items-center justify-center">
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <span className="text-xs">Iniciando instância...</span>
                  </div>
                )}
              </div>

              {!isConnected && (
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Abra o WhatsApp no celular &gt; Aparelhos conectados &gt; Conectar um aparelho.
                </p>
              )}
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO */}
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 relative">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-100">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>
              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    confirmModal.action();
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST FLUTUANTE */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400' :
              toast.type === 'error' ? 'bg-slate-900/90 border-red-500/30 text-red-400' : 'bg-slate-900/90 border-blue-500/30 text-blue-400'
            }`}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertTriangle size={16} />}
            {toast.type === 'info' && <Sparkles size={16} />}
            <span className="text-xs font-semibold text-slate-100">{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}