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
  CheckCircle2, Loader2, Image as ImageIcon, Film, Paperclip, 
  Zap, Trash2, Upload, Plus, ArrowLeft, GitFork, Search, Edit3, ListOrdered, Copy, LogOut
} from 'lucide-react';
import axios from 'axios';
import 'reactflow/dist/style.css';

const EVO_URL = "https://my-botconversa.onrender.com";
const BACKEND_URL = "https://bot-backend-edsys.onrender.com";
const API_KEY = "Ed82922545";

// =========================================================================
// 1. NÓ PERSONALIZADO
// =========================================================================
const FlowCardNode = ({ data, selected }: any) => {
  const isTrigger = data.type === 'trigger';
  const isDelay = data.type === 'delay';
  const isButtons = data.type === 'buttons';
  const buttonsList = data.buttons || ['Opção 1', 'Opção 2'];

  return (
    <div className={`relative min-w-[280px] bg-slate-900 rounded-xl shadow-xl border-2 transition-all ${
      selected ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-700/50 hover:border-slate-600'
    }`}>
      {!isTrigger && (
        <Handle type="target" position={Position.Left} className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-slate-900" />
      )}

      <div className={`px-4 py-3 rounded-t-lg flex items-center justify-between border-b ${
        isTrigger ? 'bg-emerald-500/10 border-emerald-500/20' : 
        isDelay ? 'bg-amber-500/10 border-amber-500/20' : 
        isButtons ? 'bg-purple-500/10 border-purple-500/20' : 'bg-slate-800/50 border-slate-700/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${
            isTrigger ? 'bg-emerald-500/20 text-emerald-400' :
            isDelay ? 'bg-amber-500/20 text-amber-400' :
            isButtons ? 'bg-purple-500/20 text-purple-400' :
            data.type === 'audio' ? 'bg-purple-500/20 text-purple-400' :
            data.type === 'image' ? 'bg-blue-500/20 text-blue-400' :
            data.type === 'video' ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700 text-slate-300'
          }`}>
            {isTrigger && <Zap size={16} />}
            {isDelay && <Clock size={16} />}
            {isButtons && <ListOrdered size={16} />}
            {data.type === 'text' && <MessageSquare size={16} />}
            {data.type === 'audio' && <Mic size={16} />}
            {data.type === 'image' && <ImageIcon size={16} />}
            {data.type === 'video' && <Film size={16} />}
          </div>
          <div className="font-semibold text-sm text-slate-200">{data.label}</div>
        </div>
        
        {!isTrigger && (
          <button 
            onClick={(e) => { e.stopPropagation(); if(data.onDelete) data.onDelete(); }} 
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Apagar Bloco"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="p-4 text-sm text-slate-400 flex flex-col gap-2 pointer-events-none">
        {isTrigger && <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">"{data.text}"</span>}
        {isDelay && <span>Aguardar {data.delayValue} {data.delayUnit === 'minutes' ? 'Minutos' : 'Segundos'}</span>}
        
        {!isTrigger && !isDelay && (
          <p className="line-clamp-2 text-slate-300 font-medium">{data.text || (data.mediaUrl ? '📎 Mídia Anexada' : 'Clique para configurar...')}</p>
        )}

        {isButtons && (
          <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-slate-800 pointer-events-auto">
            {buttonsList.map((btn: string, index: number) => (
              <div key={index} className="relative flex items-center justify-between bg-slate-800/90 px-3.5 py-2 rounded-lg border border-slate-700/60 text-xs font-semibold text-emerald-300">
                <span>🔘 {btn}</span>
                <Handle type="source" position={Position.Right} id={`btn_handle_${index}`} className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 !-right-[7px]" />
              </div>
            ))}
          </div>
        )}

        {data.waitForReply && !isButtons && (
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded w-fit mt-1">
            ⏸️ Pausa: Aguarda Resposta
          </span>
        )}
      </div>

      {!isButtons && (
        <Handle type="source" position={Position.Right} className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-slate-900" />
      )}
    </div>
  );
};

const nodeTypes = { custom: FlowCardNode };

const defaultNodes: Node[] = [
  { id: 'node-gatilho', type: 'custom', position: { x: 50, y: 250 }, data: { label: 'Gatilho: Palavra Chave', text: 'INICIAR', type: 'trigger' } },
  { id: 'node-msg-1', type: 'custom', position: { x: 450, y: 250 }, data: { label: 'Mensagem de Boas-Vindas', text: 'Olá! Como posso te ajudar hoje?', type: 'text' } }
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'node-gatilho', target: 'node-msg-1', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
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
  const [uploading, setUploading] = useState(false);

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
  const [connStatus, setConnStatus] = useState<string>("Verificando conexão...");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedNumber, setConnectedNumber] = useState<string>("");

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

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'builder') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedNode && selectedNode.id !== 'node-gatilho') {
          setCopiedNode(selectedNode);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (copiedNode) {
          const newNode: Node = {
            ...copiedNode,
            id: `node-${Date.now()}`,
            position: { x: copiedNode.position.x + 30, y: copiedNode.position.y + 30 },
            selected: false,
          };
          setNodes((nds) => [...nds, newNode]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, copiedNode, viewMode]);

  const handleDeleteNodeId = useCallback((idToDelete: string) => {
    if (idToDelete === 'node-gatilho') {
      alert('O Gatilho principal não pode ser apagado.');
      return;
    }
    setNodes((nds) => nds.filter((n) => n.id !== idToDelete));
    setEdges((eds) => eds.filter((e) => e.source !== idToDelete && e.target !== idToDelete));
    if (selectedNode?.id === idToDelete) setSelectedNode(null);
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
    setFlowName(`Novo Fluxo #${flowsList.length + 1}`);
    setFlowDescription('Descrição do funil...');
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
          style: { stroke: '#10b981', strokeWidth: 2 }
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
        setViewMode('builder');
      }
    } catch (error) {
      alert('Erro ao carregar dados do fluxo.');
    }
  };

  const handleDeleteFlow = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente apagar este fluxo?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/flows/${flowId}`);
      fetchFlows();
    } catch (error) {
      alert('Erro ao excluir fluxo.');
    }
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
          alert('Fluxo duplicado com sucesso!');
          fetchFlows();
        }
      }
    } catch (error) {
      alert('Erro ao duplicar o fluxo.');
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
      alert('🎉 Fluxo salvo com sucesso no banco de dados!');
      fetchFlows();
    } catch (error) {
      alert('Erro ao salvar no backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp deste dispositivo?')) return;
    try {
      setConnStatus("Desconectando...");
      await fetch(`${EVO_URL}/instance/logout/bot_oficial_v2`, {
        method: 'DELETE',
        headers: { "apikey": API_KEY }
      });
      setIsConnected(false);
      setConnectedNumber("");
      setQrCode(null);
      setConnStatus("Aparelho desconectado. Gerando novo QR Code...");
    } catch (error) {
      alert("Erro de segurança (CORS) no navegador. Desconecte diretamente pelo WhatsApp no seu celular por enquanto.");
      setConnStatus("WhatsApp Conectado!");
    }
  };

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }, eds)), []);

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
          if (nodeType === 'audio') updatedLabel = isPtt ? 'Áudio (Gravado na Hora)' : 'Áudio (Encaminhado)';
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
  };

  // =========================================================================
  // RADAR DE CONEXÃO (RODA CONTINUAMENTE)
  // =========================================================================
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${EVO_URL}/instance/connect/bot_oficial_v2`, { 
          method: "GET", 
          headers: { "apikey": API_KEY } 
        });
        const data = await res.json();
        
        if (data.instance && data.instance.state === "open") {
          setIsConnected(true); 
          setConnStatus("WhatsApp Conectado!"); 
          setQrCode(null);
          
          // Busca o número real na rota correta
          try {
            const fetchRes = await fetch(`${EVO_URL}/instance/fetchInstances?instanceName=bot_oficial_v2`, {
              method: "GET", headers: { "apikey": API_KEY }
            });
            const instancesData = await fetchRes.json();
            if (instancesData && instancesData.length > 0) {
              const owner = instancesData[0].ownerJid || instancesData[0].instance?.ownerJid;
              if (owner) setConnectedNumber(owner.split('@')[0]);
            }
          } catch (e) {}

        } else {
          setIsConnected(false);
          setConnectedNumber("");
          if (data.base64 || data.qrcode?.base64) {
            setQrCode(data.base64 || data.qrcode?.base64);
            setConnStatus("Aguardando leitura do QR Code...");
          }
        }
      } catch (error) { 
        setIsConnected(false);
        setConnectedNumber("");
        setConnStatus("Erro ao verificar conexão da API."); 
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredFlows = flowsList.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (viewMode === 'dashboard') {
    return (
      <div className="w-screen h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><GitFork className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <h1 className="font-bold text-lg text-slate-100">Gerenciador de Funis</h1>
              <p className="text-xs text-slate-400">Plataforma de Automação para WhatsApp</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsConnectModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}>
              {isConnected ? <CheckCircle2 size={16} /> : <Smartphone size={16} />}
              {isConnected ? `Conectado: ${connectedNumber}` : 'WhatsApp Desconectado'}
            </button>
            <button onClick={handleCreateNewFlow} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95">
              <Plus size={18} /> Novo Fluxo
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between mb-8 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Buscar fluxo por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:border-emerald-500 outline-none" />
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Total de Fluxos: <span className="text-emerald-400">{flowsList.length}</span></div>
          </div>

          {loadingFlows ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
          ) : filteredFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-2xl">
              <GitFork className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium text-sm">Nenhum fluxo encontrado.</p>
              <button onClick={handleCreateNewFlow} className="mt-4 text-xs font-semibold text-emerald-400 hover:underline">Criar primeiro fluxo do zero →</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlows.map((flow) => (
                <div key={flow.id} onClick={() => handleEditFlow(flow.id)} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-emerald-500/5 group cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-all"><Zap size={18} /></div>
                      
                      <div className="flex gap-2">
                        <button onClick={(e) => handleDuplicateFlow(flow.id, e)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Duplicar Fluxo">
                          <Copy size={16} />
                        </button>
                        <button onClick={(e) => handleDeleteFlow(flow.id, e)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Apagar Fluxo">
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                    <h3 className="font-bold text-slate-100 text-base mb-1 group-hover:text-emerald-400 transition-all">{flow.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">{flow.description || 'Sem descrição cadastrada.'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-500">
                    <span>{flow._count?.nodes || 0} Blocos Conectados</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-1 transition-all">Editar Canvas <Edit3 size={12} /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Conexão com WhatsApp */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col items-center gap-4 relative">
              <button onClick={() => setIsConnectModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"><X size={20} /></button>
              
              {!isConnected && <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 mt-2"><QrCode size={32} /></div>}
              
              <div className="text-center">
                <h3 className="font-bold text-lg text-slate-100">Configurações do WhatsApp</h3>
                <p className="text-xs text-slate-400 mt-1">{connStatus}</p>
              </div>

              <div className={`w-64 ${isConnected ? 'h-auto py-6' : 'h-64'} bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden my-2 px-4`}>
                {isConnected ? (
                  <div className="flex flex-col items-center justify-center w-full gap-4 text-emerald-400">
                    <CheckCircle2 size={48} />
                    <div className="text-center">
                      <span className="font-semibold text-sm block">Dispositivo Vinculado!</span>
                      <span className="text-xs text-slate-400 block mt-1">Número: {connectedNumber}</span>
                    </div>
                    <button 
                      onClick={handleDisconnect} 
                      className="mt-2 flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg text-xs font-semibold transition-all"
                    >
                      <LogOut size={14} /> Desconectar Aparelho
                    </button>
                  </div>
                ) : qrCode ? (
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <span className="text-xs">Buscando status...</span>
                  </div>
                )}
              </div>
              
              {!isConnected && <p className="text-[11px] text-slate-500 text-center">Abra o WhatsApp no celular &gt; Aparelhos conectados &gt; Conectar um aparelho.</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 font-sans antialiased overflow-hidden">
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => { setViewMode('dashboard'); fetchFlows(); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all" title="Voltar ao Dashboard"><ArrowLeft size={18} /></button>
          <div className="flex flex-col">
            <input type="text" value={flowName} onChange={(e) => setFlowName(e.target.value)} className="bg-transparent font-bold text-base text-slate-100 outline-none border-b border-transparent hover:border-slate-700 focus:border-emerald-500" />
            <span className="text-xs text-slate-400">Edição Visual • Canvas ReactFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsConnectModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}>
            {isConnected ? <CheckCircle2 size={16} /> : <Smartphone size={16} />}
            {isConnected ? `Conectado: ${connectedNumber}` : 'WhatsApp Desconectado'}
          </button>
          <button onClick={handleSaveFlow} disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/20 border-0 active:scale-95 cursor-pointer">
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Fluxo'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-3 z-10">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Adicionar Mídias</h2>
          <button onClick={() => handleAddNode('text')} className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-200 text-sm font-medium"><MessageSquare size={18}/> Texto</button>
          <button onClick={() => handleAddNode('buttons')} className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-200 text-sm font-medium"><ListOrdered size={18}/> Botões</button>
          <button onClick={() => handleAddNode('image')} className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-200 text-sm font-medium"><ImageIcon size={18}/> Imagem</button>
          <button onClick={() => handleAddNode('audio')} className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-200 text-sm font-medium"><Mic size={18}/> Áudio</button>
          <button onClick={() => handleAddNode('delay')} className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-200 text-sm font-medium"><Clock size={18}/> Smart Delay</button>
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
            <Background color="#334155" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
            <Controls />
            <MiniMap className="bg-slate-900 border-slate-800" maskColor="rgba(15, 23, 42, 0.8)" />
          </ReactFlow>
        </main>

        <aside className={`w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between z-20 absolute right-0 top-0 h-full shadow-2xl transition-all duration-300 ease-in-out ${selectedNode ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col gap-4 overflow-y-auto pb-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2"><Type className="w-4 h-4 text-emerald-400" /><h3 className="font-bold text-slate-100 text-sm">Editar Bloco</h3></div>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100"><X size={18} /></button>
            </div>

            {nodeType === 'trigger' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-emerald-400 uppercase">Gatilho</label>
                <input type="text" value={nodeText} onChange={(e) => setNodeText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:border-emerald-500" />
              </div>
            )}

            {nodeType !== 'delay' && nodeType !== 'trigger' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Mensagem</label>
                <textarea rows={3} value={nodeText} onChange={(e) => setNodeText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:border-emerald-500 resize-none" />
              </div>
            )}

            {nodeType !== 'delay' && nodeType !== 'trigger' && nodeType !== 'buttons' && (
              <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 my-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Aguardar Resposta</span>
                </div>
                <input type="checkbox" checked={waitForReply} onChange={(e) => setWaitForReply(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
              </div>
            )}

            {nodeType === 'buttons' && (
              <div className="flex flex-col gap-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <input type="text" value={button1} onChange={(e) => setButton1(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100" />
                <input type="text" value={button2} onChange={(e) => setButton2(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100" />
              </div>
            )}

            {nodeType === 'delay' && (
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={delayValue} onChange={(e) => setDelayValue(Number(e.target.value))} className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100" />
                <select value={delayUnit} onChange={(e) => setDelayUnit(e.target.value as 'seconds' | 'minutes')} className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100">
                  <option value="seconds">Segundos</option><option value="minutes">Minutos</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button onClick={handleUpdateNode} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-all">Aplicar Alterações</button>
          </div>
        </aside>

        {/* Modal de Conexão com WhatsApp no Builder */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col items-center gap-4 relative">
              <button onClick={() => setIsConnectModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"><X size={20} /></button>
              
              {!isConnected && <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 mt-2"><QrCode size={32} /></div>}
              
              <div className="text-center">
                <h3 className="font-bold text-lg text-slate-100">Configurações do WhatsApp</h3>
                <p className="text-xs text-slate-400 mt-1">{connStatus}</p>
              </div>

              <div className={`w-64 ${isConnected ? 'h-auto py-6' : 'h-64'} bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden my-2 px-4`}>
                {isConnected ? (
                  <div className="flex flex-col items-center justify-center w-full gap-4 text-emerald-400">
                    <CheckCircle2 size={48} />
                    <div className="text-center">
                      <span className="font-semibold text-sm block">Dispositivo Vinculado!</span>
                      <span className="text-xs text-slate-400 block mt-1">Número: {connectedNumber}</span>
                    </div>
                    <button 
                      onClick={handleDisconnect} 
                      className="mt-2 flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg text-xs font-semibold transition-all"
                    >
                      <LogOut size={14} /> Desconectar Aparelho
                    </button>
                  </div>
                ) : qrCode ? (
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <span className="text-xs">Buscando status...</span>
                  </div>
                )}
              </div>
              
              {!isConnected && <p className="text-[11px] text-slate-500 text-center">Abra o WhatsApp no celular &gt; Aparelhos conectados &gt; Conectar um aparelho.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}