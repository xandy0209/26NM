// ... existing imports
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { OtnRecord, SpnRecord, InternetRecord, AlarmRecord, IplRecord, MplsRecord, IgplRecord, RouteCityRecord, RouteRecord, SubscriptionRecord, ComplaintRecord, FilterState, ChatMessage, ChatSession } from './types';
// ... other imports
import { MOCK_DATA, MOCK_SPN_DATA, MOCK_INTERNET_DATA, MOCK_ALARM_DATA, MOCK_IPL_DATA, MOCK_MPLS_DATA, MOCK_IGPL_DATA, MOCK_ROUTE_CITY_DATA, MOCK_ROUTE_DATA, MOCK_SUBSCRIPTION_DATA, MOCK_COMPLAINT_DATA, INNER_MONGOLIA_CITIES } from './constants';
import { StyledInput, StyledButton, StyledSelect } from './components/UI';
import { Pagination } from './components/Pagination';
import { SearchIcon, DownloadIcon, XIcon, RefreshCwIcon, PlusCircleIcon, SendIcon, ClockIcon, CheckCircleIcon, SidebarCloseIcon, SidebarOpenIcon, FolderIcon, SettingsIcon, BarChartIcon, BellIcon, SparklesIcon, BotIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from './components/Icons';
import { ExportModal } from './components/ExportModal';
import { ComplaintModal } from './components/ComplaintModal';
import { ComplaintDetailView } from './components/ComplaintDetailView';
import { ComplaintCreateView } from './components/ComplaintCreateView';
import { ConfigCapabilitiesView } from './components/ConfigCapabilitiesView';
import { ComplaintStatsView } from './components/ComplaintStatsView';
import { AIChatPanel } from './components/AIChatPanel';
import { WorkbenchView } from './components/WorkbenchView';

// ... (Helper components Th, Td and constants remain unchanged)
const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/40 whitespace-nowrap text-xs ${className}`} {...props}>
    {children}
  </th>
);

// Helper for table data cells
const Td = ({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-3 border-b border-blue-500/10 text-white font-mono text-xs whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);

type TabType = 'workbench' | 'otn' | 'spn' | 'internet' | 'alarm' | 'ipl' | 'mpls' | 'igpl' | 'routeCity' | 'route' | 'subscription' | 'complaint' | 'ai-chat';

const TABS_CONFIG: { id: TabType; label: string }[] = [
  { id: 'workbench', label: '工作台' },
  /* Temporarily hidden tabs
  { id: 'otn', label: 'OTN专线性能指标' },
  { id: 'spn', label: 'SPN专线性能指标' },
  { id: 'internet', label: '互联网专线性能指标' },
  { id: 'alarm', label: '告警查询' },
  { id: 'ipl', label: '国际政企专线时延' },
  { id: 'mpls', label: 'MPLS-VPN专线性能' },
  { id: 'igpl', label: '国际政企专线业务' },
  { id: 'routeCity', label: '传输电路途径地市' },
  { id: 'route', label: '传输电路路由' },
  { id: 'subscription', label: '订购业务信息' },
  */
  { id: 'complaint', label: '投诉支撑' },
  { id: 'ai-chat', label: '智能助手' },
];

const MENU_ITEMS = [
  '5GToB(新)',
  '专线(新)',
  '云网(新)',
  '物联网(新)',
  '企宽(新)',
  '千里眼(新)',
  '云视讯(新)',
  '商客',
  '综合(新)',
  '系统管理(新)'
];

const BUSINESS_CATEGORIES = ['专线', '5G专网', '物联网', '企宽'];
const BUSINESS_TYPES = ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线', 'APN专线'];
const FAULT_TYPES_MAPPING: Record<string, string[]> = {
    '数据专线': ['光缆故障', '传输设备故障', '端口闪断', '其他'],
    '互联网专线': ['路由配置错误', 'DNS解析异常', '光缆故障', '其他'],
    '语音专线': ['语音网关故障', '线路杂音', '无法拨出', '其他'],
    'MPLS-VPN专线': ['VPN隧道中断', '路由不可达', '配置错误', '其他'],
    'APN专线': ['APN解析失败', '核心网侧故障', '无线侧信号弱', '其他']
};
const DEFAULT_FAULT_TYPES = ['光缆故障', '设备故障', '配置错误', '电力故障', '其他'];

// ... (Interfaces SidebarItemDef, SidebarGroup, SIDEBAR_GROUPS, initialFilterState remain unchanged)
interface ComplaintTabItem {
    id: string;
    label: string;
    type: 'pending' | 'todo' | 'done' | 'all' | 'detail' | 'create' | 'config' | 'stats';
    record?: ComplaintRecord;
    // Props to trigger tab switching inside the detail view
    targetTab?: 'basic' | 'flow' | 'process';
    triggerTimestamp?: number;
    initialData?: any; // Data for creating new ticket
}

interface SidebarItemDef {
    id: string;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badgeColor?: string;
}

interface SidebarGroup {
    id: string;
    title: string;
    items: SidebarItemDef[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
    {
        id: 'dispatch',
        title: '工单发起',
        items: [
            { id: 'new', label: '新增工单', icon: <PlusCircleIcon /> },
            { id: 'pendingDispatch', label: '故障派单(2)', icon: <SendIcon />, count: 2, badgeColor: 'bg-red-500' }
        ]
    },
    {
        id: 'processing',
        title: '工单处理',
        items: [
            { id: 'todo', label: '待办工单(10)', icon: <ClockIcon />, count: 10, badgeColor: 'bg-orange-500' },
            { id: 'done', label: '已办工单(28)', icon: <CheckCircleIcon /> }
        ]
    },
    {
        id: 'query',
        title: '综合查询',
        items: [
            { id: 'all', label: '全量工单(129)', icon: <FolderIcon /> },
            { id: 'stats', label: '统计分析', icon: <BarChartIcon /> }
        ]
    },
    {
        id: 'config',
        title: '配置管理',
        items: [
            { id: 'capabilities', label: '时限配置', icon: <SettingsIcon /> }
        ]
    }
];

const initialFilterState: FilterState = {
    productInstance: '',
    circuitCode: '',
    startDate: '',
    endDate: '',
    businessType: '',
    cityName: '',
    serviceLevel: '',
    customerName: '',
    customerCode: '',
    ticketNo: '',
    stage: '',
    keyword: '',
    ticketSource: '',
    faultType: '',
    businessCategory: '',
    productType: ''
};

export const App: React.FC = () => {
  // ... (State definitions remain unchanged up to handleDeleteSession)
  const [activeTab, setActiveTab] = useState<TabType>('workbench');
  const [visibleTabs, setVisibleTabs] = useState<TabType[]>(['workbench']);
  const [activeMenu, setActiveMenu] = useState('综合(新)'); 
  
  // Data States
  const [otnData, setOtnData] = useState<OtnRecord[]>([]);
  const [filteredOtnData, setFilteredOtnData] = useState<OtnRecord[]>([]);
  
  const [spnData, setSpnData] = useState<SpnRecord[]>([]);
  const [filteredSpnData, setFilteredSpnData] = useState<SpnRecord[]>([]);

  const [internetData, setInternetData] = useState<InternetRecord[]>([]);
  const [filteredInternetData, setFilteredInternetData] = useState<InternetRecord[]>([]);

  const [alarmData, setAlarmData] = useState<AlarmRecord[]>([]);
  const [filteredAlarmData, setFilteredAlarmData] = useState<AlarmRecord[]>([]);

  const [iplData, setIplData] = useState<IplRecord[]>([]);
  const [filteredIplData, setFilteredIplData] = useState<IplRecord[]>([]);

  const [mplsData, setMplsData] = useState<MplsRecord[]>([]);
  const [filteredMplsData, setFilteredMplsData] = useState<MplsRecord[]>([]);

  const [igplData, setIgplData] = useState<IgplRecord[]>([]);
  const [filteredIgplData, setFilteredIgplData] = useState<IgplRecord[]>([]);

  const [routeCityData, setRouteCityData] = useState<RouteCityRecord[]>([]);
  const [filteredRouteCityData, setFilteredRouteCityData] = useState<RouteCityRecord[]>([]);

  const [routeData, setRouteData] = useState<RouteRecord[]>([]);
  const [filteredRouteData, setFilteredRouteData] = useState<RouteRecord[]>([]);

  const [subscriptionData, setSubscriptionData] = useState<SubscriptionRecord[]>([]);
  const [filteredSubscriptionData, setFilteredSubscriptionData] = useState<SubscriptionRecord[]>([]);

  const [complaintData, setComplaintData] = useState<ComplaintRecord[]>([]);
  const [filteredComplaintData, setFilteredComplaintData] = useState<ComplaintRecord[]>([]);

  // Internal Complaint Tabs State
  const [complaintTabs, setComplaintTabs] = useState<ComplaintTabItem[]>([]);
  const [activeComplaintTabId, setActiveComplaintTabId] = useState<string | null>(null);

  // Independent filters per tab
  const [tabFilters, setTabFilters] = useState<Record<string, FilterState>>({});

  // Chat State
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Multi-session Chat State
  const [sessions, setSessions] = useState<ChatSession[]>([{
      id: 'default',
      title: '新会话 1',
      messages: [],
      createdAt: Date.now()
  }]);
  const [activeSessionId, setActiveSessionId] = useState('default');
  const chatSessionRefs = useRef<Record<string, Chat>>({});

  // Dropdown Menu State
  const [dropdownState, setDropdownState] = useState<{ isOpen: boolean, x: number, y: number }>({ isOpen: false, x: 0, y: 0 });

  // Ref for Menu Scrolling
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // ... (checkScroll, useEffect, scrollMenu, getChatInstance, handleSendMessage, handleNewSession, handleRenameSession remain same)
  const checkScroll = () => {
    if (menuRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = menuRef.current;
        setShowLeftArrow(scrollLeft > 1);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const el = menuRef.current;
    if (el) {
        checkScroll();
        setTimeout(checkScroll, 100);
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }
  }, []);

  const scrollMenu = (direction: 'left' | 'right') => {
    if (menuRef.current) {
        const scrollAmount = 200;
        menuRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const getChatInstance = (sessionId: string) => {
      if (!chatSessionRefs.current[sessionId]) {
           try {
               let apiKey = '';
               try { 
                   // 优先从process.env读取API_KEY
                   apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || ''; 
               } catch (e) { 
                   console.warn("Could not access process.env", e); 
               }

               if (!apiKey) {
                   console.warn("API Key missing, utilizing Mock Chat Mode.");
                   const mockChat = {
                       sendMessageStream: async function* (params: { message: any }) {
                           const msg = typeof params.message === 'string' ? params.message : 'File/Image Input';
                           await new Promise(r => setTimeout(r, 600));
                           const responseParts = [
                               "【演示模式】\n",
                               "系统检测到未配置有效的 API_KEY，当前为您展示模拟回复。\n",
                               "--------------------------------\n",
                               `收到指令: "${JSON.stringify(msg).substring(0, 50)}..."\n`,
                               "--------------------------------\n",
                               "如需启用真实 AI 能力，请在部署环境或本地 .env 文件中配置 Google Gemini API Key。"
                           ];
                           for (const part of responseParts) {
                               yield { text: part } as GenerateContentResponse;
                               await new Promise(r => setTimeout(r, 100));
                           }
                       }
                   };
                   chatSessionRefs.current[sessionId] = mockChat as unknown as Chat;
                   return chatSessionRefs.current[sessionId];
               }

               const ai = new GoogleGenAI({ apiKey });
               chatSessionRefs.current[sessionId] = ai.chats.create({
                  model: 'gemini-3-flash-preview',
                  config: {
                    systemInstruction: `You are a helpful AI assistant for an enterprise network operations support system (NM Project).
You help users query data, analyze alarms, manage tickets, and providing insights. Answer in Chinese.

**Output Formatting Rules:**

1.  **Tables:** When presenting structured data (e.g., lists of tickets, metrics comparison, alarm logs), **ALWAYS** use standard Markdown tables.
    Example:
    | ID | Name | Status |
    |---|---|---|
    | 1 | Task A | Done |

2.  **Charts:** When presenting trend data, time-series, or numerical comparisons (e.g., traffic over time, alarm counts by type), **ALWAYS** output a JSON object wrapped in a code block with the language tag \`chart\`.
    The JSON structure must be:
    \`\`\`chart
    {
      "type": "line", // or "bar"
      "title": "Chart Title",
      "xAxis": ["Label1", "Label2", "Label3"],
      "series": [
        { "name": "Series 1", "data": [10, 20, 30] },
        { "name": "Series 2", "data": [15, 25, 35] }
      ]
    }
    \`\`\`
    Do not add extra text inside the code block.

3.  **Text:** Keep textual explanations concise and professional.
`,
                  },
               });
           } catch (error) {
               console.error("Failed to initialize AI Chat:", error);
               return null;
           }
      }
      return chatSessionRefs.current[sessionId];
  };

  const handleSendMessage = async (text: string, attachment?: { mimeType: string, data: string, fileName: string }) => {
    const currentSessionId = activeSessionId;
    setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
            const isDefaultTitle = s.title.startsWith('新会话');
            const newTitle = isDefaultTitle && s.messages.length === 0 
                ? (text.length > 10 ? text.substring(0, 10) + '...' : text) 
                : s.title;
            return { 
                ...s, 
                title: newTitle,
                messages: [...s.messages, { 
                    role: 'user', 
                    text,
                    attachment: attachment ? { fileName: attachment.fileName, mimeType: attachment.mimeType } : undefined 
                }] 
            };
        }
        return s;
    }));

    const chat = getChatInstance(currentSessionId);
    if (!chat) {
        setTimeout(() => {
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    return { ...s, messages: [...s.messages, { role: 'model', text: '系统错误：AI 服务初始化异常，请刷新重试。' }] };
                }
                return s;
            }));
        }, 600);
        return;
    }

    setIsChatLoading(true);
    try {
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              return { ...s, messages: [...s.messages, { role: 'model', text: '' }] };
          }
          return s;
      }));
      let messagePayload: any = text;
      if (attachment) {
          messagePayload = [
              { inlineData: { mimeType: attachment.mimeType, data: attachment.data } },
              { text: text || `Please analyze this ${attachment.fileName} file.` }
          ];
      }
      // @ts-ignore
      const result = await chat.sendMessageStream({ message: messagePayload });
      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setSessions(prev => prev.map(s => {
              if (s.id === currentSessionId) {
                  const newMessages = [...s.messages];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'model') { lastMsg.text = fullText; }
                  return { ...s, messages: newMessages };
              }
              return s;
          }));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              const newMessages = [...s.messages];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg.role === 'model' && !lastMsg.text) {
                   lastMsg.text = '抱歉，我遇到了一些问题，请稍后再试。(如果是文件分析，请确保文件格式受支持且大小在限制范围内)';
              }
              return { ...s, messages: newMessages };
          }
          return s;
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
        id: newId,
        title: `新会话 ${sessions.length + 1}`,
        messages: [],
        createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    getChatInstance(newId);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSession = (id: string) => {
      // Create a fresh copy of the remaining sessions
      const remainingSessions = sessions.filter(s => s.id !== id);
      
      if (remainingSessions.length === 0) {
          // If no sessions left, immediately create a new default one
          const newId = `session-${Date.now()}`;
          const newSession = {
              id: newId,
              title: '新会话 1',
              messages: [],
              createdAt: Date.now()
          };
          setSessions([newSession]);
          setActiveSessionId(newId);
          getChatInstance(newId);
      } else {
          // Update the session list
          setSessions(remainingSessions);
          
          // If the deleted session was active, switch to the first available one
          if (activeSessionId === id) {
              setActiveSessionId(remainingSessions[0].id);
          }
      }
      
      // Clean up the chat instance from refs
      if (chatSessionRefs.current[id]) {
          delete chatSessionRefs.current[id];
      }
  };

  // ... (rest of the file remains unchanged: handleSelectSession, activeSessionMessages, handleExpandChat, filters, pagination, effects, render methods)
  const handleSelectSession = (id: string) => { setActiveSessionId(id); };
  
  const activeSessionMessages = useMemo(() => {
      const session = sessions.find(s => s.id === activeSessionId);
      return session ? session.messages : [];
  }, [sessions, activeSessionId]);

  const handleExpandChat = () => {
    setIsChatPanelOpen(false); 
    if (!visibleTabs.includes('ai-chat')) { setVisibleTabs(prev => [...prev, 'ai-chat']); }
    setActiveTab('ai-chat');
  };

  const getFilterKey = () => activeTab === 'complaint' ? `complaint-${activeComplaintTabId || 'default'}` : activeTab;
  const currentFilters = useMemo(() => tabFilters[getFilterKey()] || initialFilterState, [tabFilters, activeTab, activeComplaintTabId]);
  const setFilters = (newFilters: FilterState) => setTabFilters(prev => ({ ...prev, [getFilterKey()]: newFilters }));
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 15 });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilename, setExportFilename] = useState('');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintModalStage, setComplaintModalStage] = useState<'T0' | 'T1' | 'T2'>('T0');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | undefined>(undefined);
  const [complaintSidebarCollapsed, setComplaintSidebarCollapsed] = useState(false);
  const [activeSidebarFolder, setActiveSidebarFolder] = useState<string>('');

  useEffect(() => {
    setOtnData(MOCK_DATA); setFilteredOtnData(MOCK_DATA);
    setSpnData(MOCK_SPN_DATA); setFilteredSpnData(MOCK_SPN_DATA);
    setInternetData(MOCK_INTERNET_DATA); setFilteredInternetData(MOCK_INTERNET_DATA);
    setAlarmData(MOCK_ALARM_DATA); setFilteredAlarmData(MOCK_ALARM_DATA);
    setIplData(MOCK_IPL_DATA); setFilteredIplData(MOCK_IPL_DATA);
    setMplsData(MOCK_MPLS_DATA); setFilteredMplsData(MOCK_MPLS_DATA);
    setIgplData(MOCK_IGPL_DATA); setFilteredIgplData(MOCK_IGPL_DATA);
    setRouteCityData(MOCK_ROUTE_CITY_DATA); setFilteredRouteCityData(MOCK_ROUTE_CITY_DATA);
    setRouteData(MOCK_ROUTE_DATA); setFilteredRouteData(MOCK_ROUTE_DATA);
    setSubscriptionData(MOCK_SUBSCRIPTION_DATA); setFilteredSubscriptionData(MOCK_SUBSCRIPTION_DATA);
    setComplaintData(MOCK_COMPLAINT_DATA); setFilteredComplaintData(MOCK_COMPLAINT_DATA);
    getChatInstance('default');
  }, []);

  useEffect(() => { setPagination(prev => ({ ...prev, currentPage: 1 })); }, [activeTab, activeComplaintTabId]);

  const handleCloseTab = (e: React.MouseEvent, tabId: TabType) => {
      e.stopPropagation();
      const newTabs = visibleTabs.filter(id => id !== tabId);
      setVisibleTabs(newTabs);
      if (activeTab === tabId && newTabs.length > 0) {
          const closedIndex = visibleTabs.indexOf(tabId);
          const nextIndex = Math.max(0, closedIndex - 1);
          setActiveTab(newTabs[nextIndex] || newTabs[0]);
      }
  };

  const handleRestoreTabs = () => { setVisibleTabs(['complaint']); setActiveTab('complaint'); };

  const handleOpenTab = (tabId: TabType) => {
      if (!visibleTabs.includes(tabId)) {
          setVisibleTabs(prev => [...prev, tabId]);
      }
      setActiveTab(tabId);
  };

  const handleSidebarClick = (key: string) => {
      setActiveSidebarFolder(key);
      if (key === 'new') {
          const tabId = 'new-ticket';
          if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '新增工单', type: 'create' }]);
          setActiveComplaintTabId(tabId);
      } else if (key === 'capabilities') {
          const tabId = 'config-capabilities';
          if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '时限配置', type: 'config' }]);
          setActiveComplaintTabId(tabId);
      } else if (key === 'stats') {
          const tabId = 'stats-analysis';
          if (!complaintTabs.find(t => t.id === tabId)) setComplaintTabs(prev => [...prev, { id: tabId, label: '统计分析', type: 'stats' }]);
          setActiveComplaintTabId(tabId);
      } else {
          const map: Record<string, {label: string, type: 'pending' | 'todo' | 'done' | 'all'}> = {
              'pendingDispatch': { label: '故障派单', type: 'pending' },
              'todo': { label: '待办工单', type: 'todo' },
              'done': { label: '已办工单', type: 'done' },
              'all': { label: '全量工单', type: 'all' }
          };
          const target = map[key];
          if (target) {
              if (!complaintTabs.find(t => t.id === key)) setComplaintTabs(prev => [...prev, { id: key, label: target.label, type: target.type }]);
              setActiveComplaintTabId(key);
          }
      }
  };

  // ... (handleCloseComplaintTab, handleTicketClick, handleOperationClick, handleDispatchClick, handleSearch, currentFilteredData, paginatedData, handleExportClick, handleExportConfirm, handleComplaintSubmit, toggleFullScreen, renderStandardView, renderComplaintContent remain unchanged)
  
  const handleCloseComplaintTab = (e: React.MouseEvent | null, id: string) => {
      if (e) e.stopPropagation();
      const newTabs = complaintTabs.filter(t => t.id !== id);
      setComplaintTabs(newTabs);
      if (activeComplaintTabId === id) {
          if (newTabs.length > 0) {
              const nextTab = newTabs[newTabs.length - 1];
              setActiveComplaintTabId(nextTab.id);
              if (nextTab.type === 'stats') setActiveSidebarFolder('stats');
              else if (nextTab.type === 'config') setActiveSidebarFolder('capabilities');
              else if (nextTab.type === 'create') setActiveSidebarFolder('new');
              else if (nextTab.type !== 'detail') setActiveSidebarFolder(nextTab.id);
              else setActiveSidebarFolder('');
          } else {
              setActiveComplaintTabId(null);
              setActiveSidebarFolder('');
          }
      }
  };

  const handleTicketClick = (record: ComplaintRecord) => {
      const tabId = `detail-${record.id}`;
      if (!complaintTabs.find(t => t.id === tabId)) {
          setComplaintTabs(prev => [...prev, { id: tabId, label: `详情: ${record.ticketNo}`, type: 'detail', record: record }]);
      }
      setActiveComplaintTabId(tabId);
      setActiveSidebarFolder('');
  };

  const handleOperationClick = (record: ComplaintRecord, isViewOnly: boolean = false) => {
      const tabId = `detail-${record.id}`;
      const shouldShowProcess = !isViewOnly && ['T0', 'T1', 'T2'].includes(record.stage);
      const targetTab = shouldShowProcess ? 'process' : 'basic';
      setComplaintTabs(prev => {
          const existing = prev.find(t => t.id === tabId);
          if (existing) return prev.map(t => t.id === tabId ? { ...t, targetTab, triggerTimestamp: Date.now() } : t);
          return [...prev, { id: tabId, label: `详情: ${record.ticketNo}`, type: 'detail', record: record, targetTab, triggerTimestamp: Date.now() }];
      });
      setActiveComplaintTabId(tabId);
      setActiveSidebarFolder('');
  };

  const handleDispatchClick = (record: ComplaintRecord) => {
      const tabId = `dispatch-${record.id}`;
      if (!complaintTabs.find(t => t.id === tabId)) {
          setComplaintTabs(prev => [...prev, { id: tabId, label: '新增工单', type: 'create', initialData: { ...record, contactPerson: '', contactPhone: '', businessType: record.productType } }]);
      }
      setActiveComplaintTabId(tabId);
      setActiveSidebarFolder('new');
  };

  const handleSearch = () => {
    // ... same filtering logic as before ...
    const f = currentFilters;
    const applyFilters = (item: any, isAlarm = false) => {
        let match = true;
        if (f.productInstance && !item.productInstance.toLowerCase().includes(f.productInstance.toLowerCase())) match = false;
        if (activeTab !== 'mpls' && activeTab !== 'subscription' && f.circuitCode && !item.circuitCode.toLowerCase().includes(f.circuitCode.toLowerCase())) match = false;
        
        // Date filters for standard views
        if (activeTab !== 'igpl' && activeTab !== 'routeCity' && activeTab !== 'route' && activeTab !== 'subscription' && activeTab !== 'complaint' && activeTab !== 'ai-chat' && activeTab !== 'workbench') {
            const timeField = isAlarm ? item.eventTime : item.metricTime;
            if (timeField) {
                if (f.startDate && new Date(timeField.replace(' ', 'T')).getTime() < new Date(f.startDate).getTime()) match = false;
                if (f.endDate && new Date(timeField.replace(' ', 'T')).getTime() > new Date(f.endDate).getTime()) match = false;
            }
        }
        
        if (isAlarm && f.businessType && item.businessType !== f.businessType) match = false;
        if (activeTab === 'routeCity' && f.cityName && !item.cityName.includes(f.cityName)) match = false;
        
        if (activeTab === 'subscription') {
            if (f.businessType && item.serviceType !== f.businessType) match = false;
            if (f.serviceLevel && item.serviceLevel !== f.serviceLevel) match = false;
            if (f.customerName && !item.customerName.toLowerCase().includes(f.customerName.toLowerCase())) match = false;
            if (f.customerCode && !item.customerCode.toLowerCase().includes(f.customerCode.toLowerCase())) match = false;
        }
        
        if (activeTab === 'complaint' && activeComplaintTabId) {
             const activeInternalTab = complaintTabs.find(t => t.id === activeComplaintTabId);
             
             // Keyword filtering logic
             if (f.keyword) {
                 const kw = f.keyword.toLowerCase();
                 const matchesKeyword = (item.ticketNo && item.ticketNo.toLowerCase().includes(kw)) || (item.customerName && item.customerName.toLowerCase().includes(kw)) || (item.customerCode && item.customerCode.toLowerCase().includes(kw)) || (item.circuitCode && item.circuitCode.toLowerCase().includes(kw)) || (item.productInstance && item.productInstance.toLowerCase().includes(kw));
                 if (!matchesKeyword) match = false;
             }
             
             if (f.businessType && item.businessCategory !== f.businessType) match = false;
             
             // Specific Complaint Tab Logic
             if (activeInternalTab && activeInternalTab.type !== 'detail' && activeInternalTab.type !== 'create' && activeInternalTab.type !== 'config' && activeInternalTab.type !== 'stats') {
                 
                 // Pending Dispatch Logic
                 if (activeInternalTab.type === 'pending') {
                     if (item.stage !== 'T0') match = false;
                     // Only filter by productType if selected
                     if (f.productType && item.productType !== f.productType) match = false;
                     // Only filter by faultType if selected
                     if (f.faultType && item.faultType !== f.faultType) match = false;
                 }
                 // Todo Logic
                 else if (activeInternalTab.type === 'todo') {
                     if (item.stage !== 'T0' && item.stage !== 'T1' && item.stage !== 'T2') match = false;
                     
                     if (f.stage && item.stage !== f.stage) match = false;

                     // Filter by productType (Business Type)
                     if (f.productType && item.productType !== f.productType) match = false;
                     
                     if (f.businessCategory && item.businessCategory !== f.businessCategory) match = false;
                 }
                 // Done Logic
                 else if (activeInternalTab.type === 'done') {
                     if (f.stage && item.stage !== f.stage) match = false;
                     // In 'done' view, we usually show history/archived, but let's assume default is 'Closed' or 'T2' completed
                     // The user requested 'Done' list, typically meaning closed or finished
                     // But if stage filter is applied, follow it. If not, maybe show all non-active?
                     // Existing logic: else if (!f.stage && item.stage !== 'T2' && item.stage !== 'Closed') match = false;
                     // Let's stick to existing default logic for now unless explicit filter
                     else if (!f.stage && item.stage !== 'T2' && item.stage !== 'Closed') match = false;
                     
                     // ADDED: Business Category & Product Type filtering for Done tab
                     if (f.businessCategory && item.businessCategory !== f.businessCategory) match = false;
                     if (f.productType && item.productType !== f.productType) match = false;

                     if (f.startDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() < new Date(f.startDate).getTime()) match = false;
                     if (f.endDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() > new Date(f.endDate).getTime()) match = false;
                 }
                 // All Logic
                 else if (activeInternalTab.type === 'all') {
                     if (f.stage && item.stage !== f.stage) match = false;
                     if (f.startDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() < new Date(f.startDate).getTime()) match = false;
                     if (f.endDate && new Date(item.complaintTime.replace(' ', 'T')).getTime() > new Date(f.endDate).getTime()) match = false;
                     if (f.ticketSource && item.ticketSource !== f.ticketSource) match = false;
                     if (f.faultType && item.faultType !== f.faultType) match = false;
                     if (f.businessCategory && item.businessCategory !== f.businessCategory) match = false;
                     if (f.productType && item.productType !== f.productType) match = false;
                 }
             }
        }
        return match;
    };

    if (activeTab === 'otn') setFilteredOtnData(otnData.filter(item => applyFilters(item)));
    else if (activeTab === 'spn') setFilteredSpnData(spnData.filter(item => applyFilters(item)));
    else if (activeTab === 'internet') setFilteredInternetData(internetData.filter(item => applyFilters(item)));
    else if (activeTab === 'ipl') setFilteredIplData(iplData.filter(item => applyFilters(item)));
    else if (activeTab === 'mpls') setFilteredMplsData(mplsData.filter(item => applyFilters(item)));
    else if (activeTab === 'igpl') setFilteredIgplData(igplData.filter(item => applyFilters(item)));
    else if (activeTab === 'routeCity') setFilteredRouteCityData(routeCityData.filter(item => applyFilters(item)));
    else if (activeTab === 'route') setFilteredRouteData(routeData.filter(item => applyFilters(item)));
    else if (activeTab === 'subscription') setFilteredSubscriptionData(subscriptionData.filter(item => applyFilters(item)));
    else if (activeTab === 'complaint') setFilteredComplaintData(complaintData.filter(item => applyFilters(item)));
    else if (activeTab === 'workbench') {} // No filtering for Workbench view yet
    else setFilteredAlarmData(alarmData.filter(item => applyFilters(item, true)));
    setPagination(prev => ({ ...prev, currentPage: 1 })); 
  };

  useEffect(() => { handleSearch(); }, [activeTab, activeComplaintTabId]);

  const currentFilteredData = useMemo(() => {
      switch(activeTab) {
          case 'otn': return filteredOtnData;
          case 'spn': return filteredSpnData;
          case 'internet': return filteredInternetData;
          case 'alarm': return filteredAlarmData;
          case 'ipl': return filteredIplData;
          case 'mpls': return filteredMplsData;
          case 'igpl': return filteredIgplData;
          case 'routeCity': return filteredRouteCityData;
          case 'route': return filteredRouteData;
          case 'subscription': return filteredSubscriptionData;
          case 'complaint': return filteredComplaintData;
          default: return [];
      }
  }, [activeTab, filteredOtnData, filteredSpnData, filteredInternetData, filteredAlarmData, filteredIplData, filteredMplsData, filteredIgplData, filteredRouteCityData, filteredRouteData, filteredSubscriptionData, filteredComplaintData]);

  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return currentFilteredData.slice(start, end);
  }, [currentFilteredData, pagination]);

  const handleExportClick = () => {
    const now = new Date();
    const timestamp = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
    let prefix = 'OTN专线性能数据';
    if (activeTab === 'spn') prefix = 'SPN专线性能数据';
    if (activeTab === 'internet') prefix = '互联网专线性能数据';
    if (activeTab === 'alarm') prefix = '告警查询数据';
    if (activeTab === 'ipl') prefix = '国际政企专线时延数据';
    if (activeTab === 'mpls') prefix = 'MPLS-VPN专线性能数据';
    if (activeTab === 'igpl') prefix = '国际政企专线业务数据';
    if (activeTab === 'routeCity') prefix = '传输电路途径地市数据';
    if (activeTab === 'route') prefix = '传输电路路由数据';
    if (activeTab === 'subscription') prefix = '订购业务信息数据';
    if (activeTab === 'complaint') prefix = `投诉支撑_${activeComplaintTabId || 'all'}_数据`;
    setExportFilename(`${prefix}_${timestamp}.csv`);
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = (filename: string) => { setIsExportModalOpen(false); };
  const handleComplaintSubmit = () => { setIsComplaintModalOpen(false); };
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => { console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`); });
    } else { if (document.exitFullscreen) document.exitFullscreen(); }
  };

  const renderStandardView = () => null; 

  const renderComplaintContent = () => {
    // ... existing implementation ...
    const activeTabObj = complaintTabs.find(t => t.id === activeComplaintTabId);
    if (!activeTabObj) return null;
    if (activeTabObj.type === 'create') return <ComplaintCreateView onCancel={() => handleCloseTab(null as any, activeTabObj.id as any)} onSubmit={() => { handleCloseComplaintTab(null, activeTabObj.id); handleSearch(); }} initialData={activeTabObj.initialData} />;
    if (activeTabObj.type === 'detail' && activeTabObj.record) return <ComplaintDetailView record={activeTabObj.record} targetTab={activeTabObj.targetTab} triggerTimestamp={activeTabObj.triggerTimestamp} />;
    if (activeTabObj.type === 'config') return <ConfigCapabilitiesView />;
    if (activeTabObj.type === 'stats') return <ComplaintStatsView />;

    // ... existing table rendering logic ...
    const isPending = activeTabObj.type === 'pending';
    const isTodo = activeTabObj.type === 'todo';
    const isDone = activeTabObj.type === 'done';
    const isAll = activeTabObj.type === 'all';
    
    const showDateInputs = activeTabObj.type === 'done' || activeTabObj.type === 'all';
    
    // ... column definitions ...
    const pendingKeywordPlaceholder = "客户名称/客户编号/业务标识";
    const pendingCols = [
        { label: '故障时间', key: 'faultTime' },
        { label: '故障类型', key: 'faultType' },
        { label: '故障描述', key: 'complaintContent' },
        { label: '业务类型', key: 'businessCategory' }, 
        { label: '业务标识', key: 'productInstance' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
    ];
    
    const todoKeywordPlaceholder = "工单编号/客户名称/客户编号/业务标识/电路代号";
    const todoCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '状态', key: 'stage' },
        { label: '派单时间', key: 'complaintTime' },
        { label: '处理时限', key: 'slaDeadline' },
        { label: '投诉内容', key: 'complaintContent' },
        { label: '业务分类', key: 'businessCategory' },
        { label: '业务类型', key: 'productType' }, 
        { label: '业务标识', key: 'productInstance' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
    ];

    const doneKeywordPlaceholder = "工单编号/客户名称/客户编号/电路代号";
    const doneCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '状态', key: 'stage' },
        { label: '派单时间', key: 'complaintTime' },
        { label: '处理时限', key: 'slaDeadline' },
        { label: '投诉内容', key: 'complaintContent' },
        { label: '业务分类', key: 'businessCategory' },
        { label: '业务类型', key: 'productType' },
        { label: '业务标识', key: 'productInstance' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
        { label: '完成时间', key: 'finishTime' },
    ];

    const allKeywordPlaceholder = "工单编号/客户名称/客户编号/业务标识/电路代号";
    const allCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '状态', key: 'stage' },
        { label: '派单时间', key: 'complaintTime' },
        { label: '处理时限', key: 'slaDeadline' },
        { label: '投诉内容', key: 'complaintContent' },
        { label: '业务分类', key: 'businessCategory' },
        { label: '业务类型', key: 'productType' },
        { label: '业务标识', key: 'productInstance' },
        { label: '客户名称', key: 'customerName' },
        { label: '客户编号', key: 'customerCode' },
        { label: '完成时间', key: 'finishTime' },
    ];

    const defaultCols = [
        { label: '工单编号', key: 'ticketNo' },
        { label: '环节', key: 'stage' },
        { label: '客户名称', key: 'customerName' },
        { label: '产品实例', key: 'productInstance' },
        { label: '电路代号', key: 'circuitCode' },
        { label: '故障时间', key: 'faultTime' },
        { label: 'SLA状态', key: 'slaStatus' },
        { label: '当前处理人', key: 'assignee' },
    ];

    const currentCols = isPending ? pendingCols : isTodo ? todoCols : isDone ? doneCols : isAll ? allCols : defaultCols;
    const currentPlaceholder = isPending ? pendingKeywordPlaceholder : isTodo ? todoKeywordPlaceholder : isDone ? doneKeywordPlaceholder : isAll ? allKeywordPlaceholder : "工单号/客户/电路/关键字...";

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b1730]/40 backdrop-blur-sm border border-blue-500/30">
            {/* Filter Bar ... */}
            <div className="bg-blue-900/10 p-3 border-b border-blue-500/20 flex flex-wrap items-center gap-3 shrink-0">
               {/* ... filters ... */}
               <StyledInput 
                    placeholder={currentPlaceholder} 
                    className="w-80" 
                    value={currentFilters.keyword || ''} 
                    onChange={(e) => setFilters({...currentFilters, keyword: e.target.value})} 
                />
                {/* ... other filters based on tab type ... */}
                {isPending && (
                    <>
                        <StyledSelect className="w-32" value={currentFilters.productType || ''} onChange={(e) => setFilters({...currentFilters, productType: e.target.value, faultType: ''})}>
                            <option value="">业务类型</option>
                            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </StyledSelect>
                        <StyledSelect className="w-32" value={currentFilters.faultType || ''} onChange={(e) => setFilters({...currentFilters, faultType: e.target.value})}>
                            <option value="">故障类型</option>
                            {(currentFilters.productType && FAULT_TYPES_MAPPING[currentFilters.productType] ? FAULT_TYPES_MAPPING[currentFilters.productType] : DEFAULT_FAULT_TYPES).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </StyledSelect>
                    </>
                )}
                {/* ... (rest of filter rendering logic) ... */}
                {/* ... Buttons ... */}
                <div className="flex items-center gap-3 ml-auto">
                    <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />} className="whitespace-nowrap">查询</StyledButton>
                    <StyledButton variant="toolbar" onClick={handleExportClick} icon={<DownloadIcon />} className="whitespace-nowrap">导出</StyledButton>
                </div>
            </div>
            
            {/* Table Area ... */}
            <div className="flex-1 overflow-auto bg-[#0b1730]/20 scrollbar-thin">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0c2242] text-white z-10 shadow-sm">
                        <tr> 
                            {currentCols.map(col => <Th key={col.key}>{col.label}</Th>)}
                            <Th className="text-center bg-[#0c2242] sticky right-0 z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">操作</Th> 
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => {
                                const record = item as ComplaintRecord;
                                return (
                                <tr key={record.id} className="hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 last:border-0 group">
                                    {/* ... Row Content based on tab type ... */}
                                    {isPending ? (
                                        <>
                                            <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{record.faultTime}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.faultType || '-'}</td>
                                            <td className="p-3 max-w-[200px] truncate border-b border-blue-500/10" title={record.complaintContent}>{record.complaintContent}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.productType || '-'}</td>
                                            <td className="p-3 font-mono border-b border-blue-500/10">{record.productInstance}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.customerName}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10">{record.customerCode}</td>
                                        </>
                                    ) : (
                                        // ... other cases ...
                                        <>
                                            <td className="p-3 font-mono text-neon-blue cursor-pointer hover:underline border-b border-blue-500/10" onClick={() => handleTicketClick(record)}>{record.ticketNo}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.stage}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.customerName}</td>
                                            <td className="p-3 font-mono border-b border-blue-500/10">{record.productInstance}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.circuitCode}</td>
                                            <td className="p-3 font-mono text-gray-300 border-b border-blue-500/10">{record.faultTime}</td>
                                            <td className="p-3 border-b border-blue-500/10">{record.slaStatus}</td>
                                            <td className="p-3 text-gray-300 border-b border-blue-500/10">{record.assignee}</td>
                                        </>
                                    )}
                                    <td className="p-3 text-center sticky right-0 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] bg-[#0b1730] border-b border-blue-500/10">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* ... Actions ... */}
                                            <button onClick={(e) => { e.stopPropagation(); handleOperationClick(record, true); }} className="text-xs px-2 py-0.5 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/50 text-blue-300 rounded">
                                                查看
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})
                        ) : ( <tr> <td colSpan={currentCols.length + 1} className="p-8 text-center text-blue-300/50 border-b border-blue-500/10">暂无数据</td> </tr> )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination ... */}
            <div className="bg-[#1e293b]/50 h-[40px] shrink-0 border-t-0 flex items-center">
                <Pagination 
                    currentPage={pagination.currentPage} 
                    pageSize={pagination.pageSize} 
                    totalItems={currentFilteredData.length} 
                    onPageChange={(p) => setPagination({...pagination, currentPage: p})} 
                    onPageSizeChange={(s) => setPagination({...pagination, pageSize: s, currentPage: 1})}
                    className="py-0 px-4 w-full"
                />
            </div>
        </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-blue-100 selection:bg-neon-blue selection:text-white" style={{ backgroundImage: `url('https://tvbox-67o.pages.dev/bj.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#020617' }}>
      <div className="relative z-10 flex flex-col h-full overflow-hidden max-w-[1920px] mx-auto">
        <nav className="h-[60px] bg-[#0b1730]/20 backdrop-blur-md border-b border-blue-400/30 brightness-125 shadow-[0_0_15px_rgba(0,210,255,0.2)] flex items-center justify-between px-6 shrink-0 z-50" style={{ backgroundImage: `url('https://tvbox-67o.pages.dev/topbj.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
           <div className="flex items-center gap-3 shrink-0"><img src="https://tvbox-67o.pages.dev/logo.png" alt="logo" className="max-h-[50px] w-auto -ml-[20px]" /></div>
           <div className="flex-1 flex items-center justify-center h-full overflow-hidden mx-4 min-w-0 relative">
                {showLeftArrow && ( <button onClick={() => scrollMenu('left')} className="h-full px-2 text-blue-400/50 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0 z-20"><ChevronLeftIcon /></button> )}
                <div ref={menuRef} className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar scroll-smooth px-2 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {MENU_ITEMS.map(item => { 
                        const isActive = activeMenu === item; 
                        const hasDropdown = item === '综合(新)'; // Condition for dropdown
                        if (hasDropdown) {
                            return (
                                <div 
                                    key={item} 
                                    className={`h-full flex items-center px-3 cursor-pointer text-sm font-medium tracking-wide transition-colors duration-300 shrink-0 whitespace-nowrap gap-1 ${isActive ? 'text-neon-blue' : 'text-white hover:text-neon-blue'}`}
                                    onClick={() => setActiveMenu(item)}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setDropdownState({ isOpen: true, x: rect.left, y: rect.bottom });
                                    }}
                                    onMouseLeave={() => setDropdownState(prev => ({...prev, isOpen: false}))}
                                >
                                    {item}
                                    <ChevronDownIcon />
                                </div>
                            );
                        }
                        return ( 
                            <div key={item} className={`h-full flex items-center px-3 cursor-pointer text-sm font-medium tracking-wide transition-colors duration-300 shrink-0 whitespace-nowrap ${isActive ? 'text-neon-blue' : 'text-white hover:text-neon-blue'}`} onClick={() => setActiveMenu(item)}>{item}</div> 
                        ); 
                    })}
                </div>
                {showRightArrow && ( <button onClick={() => scrollMenu('right')} className="h-full px-2 text-blue-400/50 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0 z-20"><ChevronRightIcon /></button> )}
           </div>
           <div className="flex items-center gap-5 text-blue-300 shrink-0 whitespace-nowrap">
              <button className="hover:opacity-80 transition-opacity" onClick={toggleFullScreen} title="全屏显示"><img src="https://tvbox-67o.pages.dev/qp.png" alt="全屏" className="w-[10px] h-[10px]" /></button>
              <div className="h-4 w-[1px] bg-blue-500/30"></div>
              <div className="flex items-center gap-3"><span className="text-sm font-medium text-blue-100 tracking-wide shrink-0">吴军校</span><div className="w-8 h-8 rounded-full overflow-hidden border border-blue-400/50 shadow-[0_0_8px_rgba(0,210,255,0.4)] shrink-0"><img src="https://tvbox-67o.pages.dev/head.jpg" alt="User" className="w-full h-full object-cover" /></div></div>
           </div>
        </nav>
        {/* Changed background color to #0A3458/90 as requested */}
        <div className="flex items-center shrink-0 w-full bg-[#0A3458]/90 z-40 overflow-x-auto no-scrollbar">
            {visibleTabs.length === 0 ? ( <div className="text-gray-400 text-sm px-4 py-2 italic">无打开的页签</div> ) : (
                visibleTabs.map(tabId => {
                    const tabConfig = TABS_CONFIG.find(t => t.id === tabId);
                    if (!tabConfig) return null;
                    const isActive = activeTab === tabId;
                    return ( <div key={tabId} className="relative group cursor-pointer min-w-0" onClick={() => setActiveTab(tabId)}> <div className={`flex items-center justify-center gap-1 px-4 py-2 ${isActive ? 'bg-[#124979] border-blue-400/50 text-white' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#0e2a55]/10'} border-r border-t-0 border-b-0 border-l-0 border-blue-500/10 text-sm tracking-wide transition-all whitespace-nowrap overflow-hidden`}> <span className={`truncate ${isActive ? "drop-shadow-[0_0_5px_rgba(0,210,255,0.5)]" : ""}`}>{tabConfig.label}</span> <button onClick={(e) => handleCloseTab(e, tabId)} className={`ml-2 flex-shrink-0 transition-colors focus:outline-none ${isActive ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-300'}`} title="关闭"><XIcon /></button> </div> </div> );
                })
            )}
        </div>
        <div className="flex-1 flex flex-col p-[10px] overflow-hidden min-h-0 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'ai-chat' ? (
                    <div className="flex-1 flex flex-col h-full">
                        <AIChatPanel messages={activeSessionMessages} sessions={sessions} activeSessionId={activeSessionId} onNewSession={handleNewSession} onSelectSession={handleSelectSession} onSendMessage={handleSendMessage} isLoading={isChatLoading} mode="tab" onRenameSession={handleRenameSession} onDeleteSession={handleDeleteSession} />
                    </div>
                ) : activeTab === 'workbench' ? (
                    <div className="flex-1 flex flex-col h-full">
                        <WorkbenchView />
                    </div>
                ) : visibleTabs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-blue-300/50"> <div className="text-6xl mb-4">🗂️</div> <div className="text-xl">所有页签已关闭</div> <button onClick={handleRestoreTabs} className="mt-4 px-4 py-2 bg-blue-600/30 border border-blue-500 hover:bg-blue-600/50 text-white rounded">重新打开</button> </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        {activeTab === 'complaint' && (
                            <div className={`${complaintSidebarCollapsed ? 'w-[53px]' : 'w-48'} bg-[#0c2242]/25 backdrop-blur-md border border-blue-500/30 mr-2 transition-all duration-500 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                                <div className={`h-10 flex items-center ${complaintSidebarCollapsed ? 'justify-center' : 'justify-start px-3'} border-b border-blue-500/20 bg-[#0c1a35]/20`}> <button onClick={() => setComplaintSidebarCollapsed(!complaintSidebarCollapsed)} className="text-blue-300 hover:text-white transition-colors flex items-center justify-center"> <div className="w-5 h-5 flex items-center justify-center">{complaintSidebarCollapsed ? <SidebarOpenIcon /> : <SidebarCloseIcon />}</div> </button> </div>
                                <div className="flex-1 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                    {SIDEBAR_GROUPS.map((group) => (
                                        <div key={group.id} className="flex flex-col gap-1">
                                            {!complaintSidebarCollapsed && ( <div className="px-3 py-1 text-xs text-blue-400/70 font-bold uppercase tracking-wider border-b border-blue-500/10 mb-1 mx-1">{group.title}</div> )}
                                            {group.items.map(item => ( <div key={item.id} onClick={() => handleSidebarClick(item.id)} className={`relative flex items-center gap-3 px-3 py-2 cursor-pointer transition-all mx-1 rounded-sm ${activeSidebarFolder === item.id ? 'bg-gradient-to-r from-blue-600/40 to-blue-600/10 text-white border-l-2 border-neon-blue shadow-[0_0_10px_rgba(0,210,255,0.2)]' : 'text-white/80 hover:bg-white/10 hover:text-white border-l-2 border-transparent'} ${complaintSidebarCollapsed ? 'justify-center px-0' : ''}`} title={complaintSidebarCollapsed ? item.label : ''}> <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">{item.icon}{complaintSidebarCollapsed && item.count && ( <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center text-[8px] rounded-full text-white ${item.badgeColor || 'bg-red-500'} ring-1 ring-[#0c2242]`}>{item.count > 9 ? '9+' : item.count}</div> )}</div> {!complaintSidebarCollapsed && ( <span className="text-sm whitespace-nowrap truncate">{item.label}</span> )} </div> ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                            {activeTab === 'complaint' && complaintTabs.length > 0 && (
                                <div className="h-10 flex items-end border-b border-blue-500/20 bg-[#0c1a35]/30 px-0 pt-0 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                                    {complaintTabs.map((tab, index) => ( <div key={tab.id} onClick={() => { setActiveComplaintTabId(tab.id); if (tab.type === 'stats') setActiveSidebarFolder('stats'); else if (tab.type === 'config') setActiveSidebarFolder('capabilities'); else if (tab.type === 'create') setActiveSidebarFolder('new'); else if (tab.type !== 'detail') setActiveSidebarFolder(tab.id); else setActiveSidebarFolder(''); }} className={`group flex items-center gap-2 px-4 py-2 cursor-pointer text-xs font-medium border-t border-r rounded-t-sm min-w-[100px] justify-center transition-all mr-0 ${index === 0 ? 'border-l' : ''} ${activeComplaintTabId === tab.id ? 'bg-[#0b1730]/20 border-blue-500/30 border-l text-neon-blue border-b-transparent z-10 shadow-[0_-2px_10px_rgba(0,210,255,0.1)]' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#0b1730]/30 border-b border-transparent'}`}> <span>{tab.label}</span> <button onClick={(e) => handleCloseComplaintTab(e, tab.id)} className={`ml-1 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors ${activeComplaintTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}> <XIcon /> </button> </div> ))}
                                </div>
                            )}
                            {activeTab === 'complaint' && complaintTabs.length === 0 ? ( <div className="flex-1 flex flex-col items-center justify-center bg-[#0b1730]/10 backdrop-blur-sm border border-blue-500/20 text-blue-300/50"> <div className="text-5xl mb-4">👈</div> <div className="text-lg">请点击左侧菜单查看工单列表</div> </div> ) : ( <> {activeTab === 'complaint' ? ( renderComplaintContent() ) : ( renderStandardView() )} </> )}
                        </div>
                    </div>
                )}
            </div>
            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onConfirm={handleExportConfirm} defaultFilename={exportFilename} />
            <ComplaintModal isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)} onConfirm={handleComplaintSubmit} initialData={selectedComplaint} stage={complaintModalStage} />
            {isChatPanelOpen && activeTab !== 'ai-chat' && ( <div className="fixed right-0 top-[60px] bottom-0 w-[520px] z-[100] animate-[slideInRight_0.3s_ease-out]"> <AIChatPanel messages={activeSessionMessages} sessions={sessions} activeSessionId={activeSessionId} onNewSession={handleNewSession} onSelectSession={handleSelectSession} onSendMessage={handleSendMessage} isLoading={isChatLoading} mode="sidebar" onExpand={handleExpandChat} onClose={() => setIsChatPanelOpen(false)} onRenameSession={handleRenameSession} onDeleteSession={handleDeleteSession} /> </div> )}
            {!isChatPanelOpen && activeTab !== 'ai-chat' && ( <button onClick={() => setIsChatPanelOpen(true)} className="fixed right-6 bottom-10 z-50 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_20px_rgba(0,210,255,0.6)] flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-pulse" title="打开智能助手"> <BotIcon /> </button> )}
            
            {/* Dropdown Portal */}
            {dropdownState.isOpen && (
                <div 
                    className="fixed z-[60] bg-[#0A3458]/30 border border-blue-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md py-2 w-36 rounded-sm animate-[fadeIn_0.1s_ease-out]"
                    style={{ top: dropdownState.y, left: dropdownState.x }}
                    onMouseEnter={() => setDropdownState(prev => ({...prev, isOpen: true}))}
                    onMouseLeave={() => setDropdownState(prev => ({...prev, isOpen: false}))}
                >
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                        onClick={() => { handleOpenTab('workbench'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('综合(新)'); }}
                    >
                        综调-工作台
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-[#1e3a5f]/80 cursor-pointer text-sm text-blue-100 hover:text-white transition-colors border-l-2 border-transparent hover:border-neon-blue" 
                        onClick={() => { handleOpenTab('complaint'); setDropdownState(prev => ({...prev, isOpen: false})); setActiveMenu('综合(新)'); }}
                    >
                        综调-投诉支撑
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};