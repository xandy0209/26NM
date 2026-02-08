
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    ClockIcon, 
    CheckCircleIcon, 
    BellIcon, 
    BarChartIcon, 
    PlusCircleIcon, 
    SearchIcon, 
    SettingsIcon, 
    UserIcon,
    ArrowDownLeftIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ListIcon,
    BotIcon,
    MenuArrowLeftIcon,
    MenuArrowRightIcon,
    XIcon,
    CloudUploadIcon as CloudUploadIconOriginal
} from './Icons';
import { StyledButton, StyledInput } from './UI';

// --- Icons specific to this view ---
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : "#4b5563"} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center overflow-hidden shrink-0">
        <img src="https://tvbox-67o.pages.dev/head.jpg" alt="User" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
    </div>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
    >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`}/>
    </div>
);

const ThreeDotsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
    </svg>
);

const MessageSquareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const GridIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

// --- Local Helper Components ---

const MenuItem = ({ label, count, active, collapsed }: { label: string, count?: number, active?: boolean, collapsed?: boolean }) => (
    <div className={`
        flex items-center cursor-pointer text-blue-100 hover:bg-[#1e3a5f]/40 transition-colors
        ${collapsed ? 'justify-center mx-auto w-full py-3 bg-[#112240]/40 border border-blue-500/20 hover:border-blue-500/40' : 'justify-between px-3 py-3 bg-[#112240]/40 border border-blue-500/20'}
        ${active ? 'bg-[#1e3a5f]/60 border-blue-500/50' : ''}
    `} title={collapsed ? label : ''}>
        {collapsed ? (
            <div className="flex items-center gap-1">
                {count !== undefined && count > 0 && <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px]">{count}</span>}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{label}</span>
                </div>
                {count !== undefined && (
                    <div className="flex items-center gap-2">
                         <span className={`text-xs px-1.5 py-0.5 rounded-full ${count > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-400'}`}>{count}</span>
                         <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                )}
            </>
        )}
    </div>
);

const SubMenuItem = ({ label, count, active }: { label: string, count?: number, active?: boolean }) => (
    <div className={`
        flex items-center justify-between px-4 py-2 cursor-pointer text-blue-200 hover:text-white hover:bg-[#1e3a5f]/30 transition-colors
        ${active ? 'bg-[#1e3a5f]/40 text-neon-blue' : ''}
    `}>
        <span className="text-xs">{label}</span>
        {count !== undefined && count > 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded-full">{count}</span>}
    </div>
);

const StatusCard = ({ label, count, active, onClick }: { label: string, count: string, active: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`
            flex items-center justify-center gap-2 px-6 py-2 cursor-pointer border-t border-x rounded-t-sm min-w-[120px] transition-all
            ${active 
                ? 'bg-[#0b1730]/40 border-blue-500/30 text-neon-blue border-b-transparent z-10 shadow-[0_-2px_10px_rgba(0,210,255,0.1)]' 
                : 'bg-[#091c33]/40 border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#0b1730]/60 border-b border-blue-500/20'}
        `}
    >
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs px-1.5 rounded-full ${active ? 'bg-blue-500/20 text-neon-blue' : 'bg-gray-700/50 text-gray-500'}`}>{count}</span>
    </div>
);

const RightTab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`
            px-3 py-1.5 text-xs font-medium rounded-sm whitespace-nowrap transition-colors
            ${active ? 'bg-blue-600/30 text-white border border-blue-500/30' : 'text-blue-300 hover:text-white hover:bg-blue-600/10'}
        `}
    >
        {label}
    </button>
);

const InfoBox = ({ label, value, fullWidth }: { label: string, value: string, fullWidth?: boolean }) => (
    <div className={`p-2 border border-blue-500/10 bg-[#094F8B]/[0.05] ${fullWidth ? 'col-span-2' : 'col-span-1'}`}>
        <div className="text-[10px] text-blue-400 mb-0.5">{label}</div>
        <div className="text-xs text-white truncate" title={value}>{value}</div>
    </div>
);

// --- Types ---
interface CallbackItem {
    id: string;
    orderMonth: string;
    scenarioCategory: string;
    productName: string;
    city: string;
    customerName: string;
    callbackPhone: string;
    status: 'pending' | 'completed';
    // Result fields
    result?: string;
    satisfaction?: string;
}

// --- Component ---

export const WorkbenchView: React.FC = () => {
    // Left Sidebar State
    const [expandedMenu, setExpandedMenu] = useState<string>('satisfaction');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isTakingOrders, setIsTakingOrders] = useState(true);

    // Main Content State
    const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'done'>('processing');

    // Right Panel State
    const [activeRightTab, setActiveRightTab] = useState<string>('assistant');
    const [rightPanelSubTab, setRightPanelSubTab] = useState<'pending' | 'completed'>('pending');
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);

    // Selection State
    const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Right Panel Data State (Callback List)
    const [callbackItems, setCallbackItems] = useState<CallbackItem[]>([]);

    // Modal State
    const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
    const [currentCallbackId, setCurrentCallbackId] = useState<string | null>(null);
    
    // Alert State
    const [validationAlert, setValidationAlert] = useState<{show: boolean, message: string}>({ show: false, message: '' });

    // Mock Callback Items Generator
    const generateCallbackItems = (taskId: number) => {
        const scenarios = ['楼宇', '园区', '泛住宿', '沿街商铺', '专业市场', '其他'];
        const products = ['企业宽带', '互联网专线', '数据专线', '云主机'];
        const cities = ['呼和浩特市', '包头市', '鄂尔多斯市', '赤峰市'];

        return Array.from({ length: 10 }).map((_, i) => ({
            id: `${taskId}-cb-${i}`,
            orderMonth: '2025-02',
            scenarioCategory: scenarios[i % scenarios.length],
            productName: products[i % products.length],
            city: cities[i % cities.length],
            customerName: `模拟客户${taskId}-${i + 1}`,
            callbackPhone: `138${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            status: 'pending' as const
        }));
    };

    const handleRowSelect = (id: number) => {
        const newSelected = new Set(selectedRowIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRowIds(newSelected);
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRowIds(new Set(filteredData.map(d => d.id)));
        } else {
            setSelectedRowIds(new Set());
        }
    };

    // Handler for processing click - opens sidebar and shows details
    const handleProcessClick = (task: any) => {
        if (selectedTask?.id !== task.id) {
            setSelectedTask(task);
            setCallbackItems(generateCallbackItems(task.id));
        }
        setIsRightPanelCollapsed(false);
        setActiveRightTab('assistant');
        setSelectedRowIds(prev => new Set(prev).add(task.id));
    };

    const handleRowClick = (task: any) => {
        handleRowSelect(task.id);
        handleProcessClick(task);
    };

    const handleOpenCallbackModal = (id: string) => {
        setCurrentCallbackId(id);
        setIsCallbackModalOpen(true);
    };

    const handleSaveCallbackResult = (resultData: any) => {
        setCallbackItems(prev => prev.map(item => {
            if (item.id === currentCallbackId) {
                return { ...item, status: 'completed', ...resultData };
            }
            return item;
        }));
        setIsCallbackModalOpen(false);
        setCurrentCallbackId(null);
    };

    const handleCompleteTask = () => {
        const pendingCount = callbackItems.filter(c => c.status === 'pending').length;
        if (pendingCount > 0) {
            setValidationAlert({
                show: true,
                message: '还存在待回访内容，请全部回访后再提交。'
            });
        } else {
            setValidationAlert({
                show: true,
                message: '处理完成！工单已归档。'
            });
            // Logic to archive main task would go here
        }
    };

    // Mock Data for Table linked to Active Tab
    const tableData = useMemo(() => {
        const statuses = ['pending', 'processing', 'done'];
        return Array.from({ length: 20 }).map((_, i) => {
            const status = statuses[i % 3];
            const startTimeStr = `2025-02-${10 + (i % 5)} 09:${10 + i}:00`;
            const startDate = new Date(startTimeStr.replace(' ', 'T'));
            const limitDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            const format = (d: Date) => {
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };
            const timeLimit = format(limitDate);

            return {
                id: i,
                taskNo: `TASK-202502${1000 + i}`,
                startTime: startTimeStr,
                visitCount: Math.floor(Math.random() * 5) + 1,
                remainingVisits: Math.floor(Math.random() * 3),
                timeLimit: timeLimit,
                finishTime: `2025-02-${10 + (i % 5)} 14:${30 + i}:00`,
                status: status,
            };
        });
    }, []);

    const filteredData = tableData.filter(item => item.status === activeTab);

    // Initial selection effect
    useEffect(() => {
        if (tableData.length > 0 && !selectedTask) {
            const initialTask = tableData[0];
            setSelectedTask(initialTask);
            setCallbackItems(generateCallbackItems(initialTask.id));
        }
    }, [tableData]);

    const displayItems = callbackItems.filter(c => rightPanelSubTab === 'pending' ? c.status === 'pending' : c.status === 'completed');

    return (
        <div className="flex h-full w-full bg-[#06264D]/50 p-[10px] text-white font-sans overflow-hidden relative">
            {/* Inner Content Wrapper */}
            <div className="flex h-full w-full bg-[#094F8B]/[0.03] overflow-hidden relative shadow-inner">
                
                {/* --- Left Sidebar --- */}
                <div 
                    className={`${isSidebarCollapsed ? 'w-[64px]' : 'w-[240px]'} bg-[#094F8B]/[0.03] border border-blue-500/30 flex flex-col shrink-0 transition-all duration-300`}
                >
                    {/* Profile Header */}
                    <div className="p-4 border-b border-blue-500/10">
                        {isSidebarCollapsed ? (
                            <div className="flex justify-center items-center h-10">
                                <button 
                                    onClick={() => setIsSidebarCollapsed(false)} 
                                    className="text-white hover:text-neon-blue transition-colors p-1"
                                >
                                    <MenuArrowRightIcon />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar />
                                        <div>
                                            <div className="text-sm font-bold text-blue-100 truncate">刘智慧</div>
                                            <div className="flex gap-0.5 mt-2">
                                                {[1,2,3,4,5].map(i => <StarIcon key={i} filled={true} />)}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsSidebarCollapsed(true)} 
                                        className="text-white hover:text-neon-blue transition-colors p-1 -mt-[10px]"
                                    >
                                        <MenuArrowLeftIcon />
                                    </button>
                                </div>
                                <div className="flex items-center justify-end gap-3 -mt-3">
                                    <ToggleSwitch checked={isTakingOrders} onChange={() => setIsTakingOrders(!isTakingOrders)} />
                                    <span className="text-xs text-blue-300">接单</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Menu List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        <MenuItem label="支撑任务" count={7} active={false} collapsed={isSidebarCollapsed} />
                        <MenuItem label="处置任务" count={0} active={false} collapsed={isSidebarCollapsed} />
                        <MenuItem label="督办任务" count={1} active={false} collapsed={isSidebarCollapsed} />

                        {/* Expanded Item (Derogatory) */}
                        <div className={`border border-blue-500/20 overflow-hidden transition-all ${isSidebarCollapsed ? 'p-0 bg-transparent border-none' : 'bg-transparent'}`}>
                            <div 
                                className={`
                                    flex items-center cursor-pointer text-blue-100 hover:bg-[#1e3a5f]/40 transition-colors
                                    ${isSidebarCollapsed ? 'justify-center mx-auto w-full py-3 bg-[#112240]/40 border border-blue-500/20 hover:border-blue-500/40' : 'justify-between px-3 py-3 bg-[#112240]/40'}
                                `}
                                onClick={() => !isSidebarCollapsed && setExpandedMenu(expandedMenu === 'derogatory' ? '' : 'derogatory')}
                                title="贬损处置任务"
                            >
                                {isSidebarCollapsed ? (
                                    <div className="flex items-center gap-1">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px]">1</span>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><polyline points="9 18 15 12 9 6"/></svg>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">贬损处置任务</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">1</span>
                                            <span className={`transform transition-transform ${expandedMenu === 'derogatory' ? 'rotate-180' : ''}`}>
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1" strokeWidth="1.5"/></svg>
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!isSidebarCollapsed && expandedMenu === 'derogatory' && (
                                <div className="bg-[#094F8B]/20 border-t border-blue-500/10">
                                    <SubMenuItem label="强制归档审核" count={0} />
                                    <SubMenuItem label="转派申请审核" count={0} />
                                    <SubMenuItem label="满意度回访" count={1} active={false} />
                                </div>
                            )}
                        </div>

                        <MenuItem label="战客任务" count={0} active={false} collapsed={isSidebarCollapsed} />

                        {/* Moved Here: 满意度回访任务 */}
                        <div className={`border border-blue-500/20 overflow-hidden transition-all ${isSidebarCollapsed ? 'p-0 bg-transparent border-none' : 'bg-transparent'}`}>
                            <div 
                                className={`
                                    flex items-center cursor-pointer text-blue-100 hover:bg-[#1e3a5f]/40 transition-colors
                                    ${isSidebarCollapsed ? 'justify-center mx-auto w-full py-3 bg-[#112240]/40 border border-blue-500/20 hover:border-blue-500/40' : 'justify-between px-3 py-3 bg-[#112240]/40'}
                                `}
                                onClick={() => !isSidebarCollapsed && setExpandedMenu(expandedMenu === 'satisfaction' ? '' : 'satisfaction')}
                                title="满意度回访任务"
                            >
                                {isSidebarCollapsed ? (
                                    <div className="flex items-center gap-1">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px]">1</span>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><polyline points="9 18 15 12 9 6"/></svg>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">满意度回访任务</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">1</span>
                                            <span className={`transform transition-transform ${expandedMenu === 'satisfaction' ? 'rotate-180' : ''}`}>
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1" strokeWidth="1.5"/></svg>
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!isSidebarCollapsed && expandedMenu === 'satisfaction' && (
                                <div className="bg-[#094F8B]/20 border-t border-blue-500/10">
                                    <SubMenuItem label="商客回访" count={callbackItems.filter(c=>c.status==='pending').length} active={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Main Content --- */}
                <div className="flex-1 min-w-0 overflow-x-auto bg-[#094F8B]/[0.03] relative border-y border-blue-500/30">
                    <div className="flex flex-col h-full min-w-full w-fit">
                        {/* Top Tabs */}
                        <div className="flex items-end gap-[6px] px-4 pt-3 shrink-0 w-full border-b border-blue-500/20">
                            <StatusCard label="待受理" count="99+" active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
                            <StatusCard label="处理中" count="1" active={activeTab === 'processing'} onClick={() => setActiveTab('processing')} />
                            <StatusCard label="已完成" count="99+" active={activeTab === 'done'} onClick={() => setActiveTab('done')} />
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center px-4 py-2 gap-3 bg-[#094F8B]/[0.03] border-b border-blue-500/10 shrink-0 w-full">
                            <div className="flex items-center">
                                <span className="text-xs text-blue-300 mr-2 whitespace-nowrap">工单编号</span>
                                <input type="text" placeholder="请输入" className="bg-[#0b1730]/20 border border-blue-500/30 text-white text-xs px-2 py-1 w-40 focus:outline-none focus:border-neon-blue" />
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs text-blue-300 mr-2 whitespace-nowrap">客户名称</span>
                                <input type="text" placeholder="请输入" className="bg-[#0b1730]/20 border border-blue-500/30 text-white text-xs px-2 py-1 w-40 focus:outline-none focus:border-neon-blue" />
                            </div>
                            <button className="px-4 py-1 bg-[#07596C] text-white text-xs hover:brightness-110 whitespace-nowrap">查询</button>
                            <div className="ml-auto flex items-center gap-4 text-blue-400">
                                <span className="text-xs cursor-pointer hover:text-white flex items-center gap-1 whitespace-nowrap">
                                    高级查询 <span className="transform rotate-90">›</span>
                                </span>
                                <div className="cursor-pointer hover:text-white"><ThreeDotsIcon /></div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto w-full">
                            <style>{`
                                .workbench-table-container::-webkit-scrollbar {
                                    width: 10px;
                                    height: 10px;
                                }
                                .workbench-table-container::-webkit-scrollbar-thumb {
                                    background: #1e3a5f;
                                    border-radius: 5px;
                                    border: 2px solid #091c33;
                                }
                                .workbench-table-container::-webkit-scrollbar-track {
                                    background: rgba(13, 34, 66, 0.6);
                                }
                                .workbench-table-container::-webkit-scrollbar-thumb:hover {
                                    background: #2563eb;
                                }
                            `}</style>
                            <div className="h-full w-full workbench-table-container overflow-auto">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="bg-[#124973] text-blue-200 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3 font-medium w-10 text-center">
                                                <input type="checkbox" className="accent-blue-500 cursor-pointer" onChange={toggleSelectAll} checked={filteredData.length > 0 && selectedRowIds.size === filteredData.length} />
                                            </th>
                                            <th className="p-3 font-medium">任务编号</th>
                                            <th className="p-3 font-medium">开始时间</th>
                                            <th className="p-3 font-medium">回访数量</th>
                                            {activeTab === 'processing' && <th className="p-3 font-medium">剩余回访数量</th>}
                                            <th className="p-3 font-medium">处理时限</th>
                                            {activeTab === 'done' ? <th className="p-3 font-medium">完成时间</th> : <th className="p-3 font-medium">操作</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300 divide-y divide-blue-500/10">
                                        {filteredData.length > 0 ? filteredData.map((item, index) => {
                                            const isSelected = selectedRowIds.has(item.id);
                                            return (
                                            <tr key={item.id} onClick={() => handleRowClick(item)} className={`${index % 2 === 0 ? 'bg-[#1e3a5f]/40' : 'bg-transparent'} ${isSelected ? 'bg-[#124973] border-l-2 border-l-neon-blue' : 'hover:bg-[#1e3a5f]/60'} transition-colors cursor-pointer`}>
                                                <td className="p-3 text-center align-top"><input type="checkbox" className="accent-blue-500 cursor-pointer" checked={isSelected} onChange={() => handleRowSelect(item.id)} onClick={(e) => e.stopPropagation()} /></td>
                                                <td className="p-3 align-top">{item.taskNo}</td>
                                                <td className="p-3 align-top">{item.startTime}</td>
                                                <td className="p-3 align-top">{item.visitCount}</td>
                                                {activeTab === 'processing' && <td className="p-3 align-top">{item.remainingVisits}</td>}
                                                <td className="p-3 align-top">{item.timeLimit}</td>
                                                {activeTab === 'done' ? <td className="p-3 align-top">{item.finishTime}</td> : <td className="p-3 align-top"><span className="text-neon-blue cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); handleProcessClick(item); }}>{item.status === 'pending' ? '受理' : '处理'}</span></td>}
                                            </tr>
                                        )}) : <tr><td colSpan={7} className="p-8 text-center text-gray-500">暂无任务数据</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="h-10 bg-[#094F8B]/[0.03] border-t border-blue-500/20 flex items-center justify-between px-4 text-xs text-gray-400 shrink-0 w-full">
                            <button className="flex items-center gap-1 border border-blue-500/30 px-3 py-1 rounded text-white bg-[#04495B] hover:brightness-110 text-xs shadow-sm">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                导出
                            </button>
                            <div className="flex items-center gap-4">
                                <span className="whitespace-nowrap">共 {filteredData.length} 条</span>
                                <div className="flex items-center gap-1">
                                    <button className="p-1 hover:text-white"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
                                    <span className="bg-blue-600 text-white px-1.5 rounded">1</span>
                                    <button className="p-1 hover:text-white"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
                                </div>
                                <select className="bg-[#0b1730]/20 border border-blue-500/30 text-xs px-1 py-0.5 outline-none"><option>15条/页</option></select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Panel --- */}
                <div className={`${isRightPanelCollapsed ? 'w-[48px]' : 'w-[380px]'} bg-[#094F8B]/[0.03] border-y border-r border-l border-blue-500/20 flex flex-col shrink-0 shadow-[-5px_0_20px_rgba(0,0,0,0.3)] transition-all duration-300`}>
                    <div className={`h-10 bg-[#094F8B]/[0.03] flex items-center border-b border-blue-500/20 ${isRightPanelCollapsed ? 'flex-col justify-start pt-2 gap-4 h-auto border-b-0' : 'justify-start px-4'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)} className="text-white hover:text-neon-blue transition-colors">
                                {isRightPanelCollapsed ? <MenuArrowLeftIcon /> : <MenuArrowRightIcon />}
                            </button>
                        </div>
                        <div className={`flex items-center gap-3 text-blue-300 ${isRightPanelCollapsed ? 'flex-col' : 'ml-[15px]'}`}>
                            <button className="hover:text-white transition-colors p-1"><MessageSquareIcon /></button>
                            <button className="hover:text-white transition-colors p-1"><GridIcon /></button>
                            <button className="hover:text-white transition-colors p-1"><BellIcon /></button>
                        </div>
                    </div>

                    {!isRightPanelCollapsed && (
                        <>
                            <div className="flex items-center p-2 gap-2 bg-[#094F8B]/[0.03] border-b border-blue-500/20 overflow-x-auto no-scrollbar">
                                <RightTab label="处置助手" active={activeRightTab === 'assistant'} onClick={() => setActiveRightTab('assistant')} />
                                <RightTab label="客户工单" active={activeRightTab === 'customer'} onClick={() => setActiveRightTab('customer')} />
                                <RightTab label="工单轨迹" active={activeRightTab === 'track'} onClick={() => setActiveRightTab('track')} />
                                <RightTab label="案例库" active={activeRightTab === 'cases'} onClick={() => setActiveRightTab('cases')} />
                                <RightTab label="工具箱" active={activeRightTab === 'tools'} onClick={() => setActiveRightTab('tools')} />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                <div className="flex items-center gap-4 mb-2 border-b border-blue-500/20 pb-2">
                                    <button 
                                        className={`text-xs font-bold transition-colors ${rightPanelSubTab === 'pending' ? 'text-neon-blue border-b-2 border-neon-blue pb-1' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => setRightPanelSubTab('pending')}
                                    >
                                        待回访清单 ({callbackItems.filter(c => c.status === 'pending').length})
                                    </button>
                                    <button 
                                        className={`text-xs font-bold transition-colors ${rightPanelSubTab === 'completed' ? 'text-neon-blue border-b-2 border-neon-blue pb-1' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => setRightPanelSubTab('completed')}
                                    >
                                        已回访清单 ({callbackItems.filter(c => c.status === 'completed').length})
                                    </button>
                                </div>
                                
                                <div className="space-y-[10px]">
                                    {displayItems.length > 0 ? displayItems.map((item) => (
                                        <div key={item.id} className="grid grid-cols-2 gap-px bg-[#094F8B]/[0.03] border border-blue-500/20 rounded overflow-hidden">
                                            <InfoBox label="订单月份" value={item.orderMonth} />
                                            <InfoBox label="场景类别" value={item.scenarioCategory} />
                                            <InfoBox label="商品名称" value={item.productName} />
                                            <InfoBox label="地市" value={item.city} />
                                            <InfoBox label="客户名称" value={item.customerName} fullWidth />
                                            <div className="p-2 border border-blue-500/10 bg-[#094F8B]/[0.05] col-span-2 flex justify-end items-center gap-2">
                                                <span className="text-xs text-blue-300 mr-auto">联系电话: {item.callbackPhone}</span>
                                                <button 
                                                    onClick={() => handleOpenCallbackModal(item.id)}
                                                    className="px-3 py-1 text-xs bg-[#07596C] hover:bg-[#097c96] text-white rounded-sm border border-blue-500/30 transition-colors"
                                                >
                                                    {item.status === 'pending' ? '回访登记' : '查看详情'}
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center text-gray-500 py-8 text-xs">暂无数据</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* --- Callback Modal --- */}
            {isCallbackModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <div className="w-[400px] bg-[#0f172a] border border-blue-500/30 text-blue-100 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/50 border-b border-blue-500/30">
                            <span className="text-sm font-bold text-white">回访登记</span>
                            <button onClick={() => setIsCallbackModalOpen(false)} className="text-gray-400 hover:text-white"><XIcon /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">回访结果</label>
                                <select className="w-full bg-[#0b1730]/20 border border-blue-500/30 text-white text-xs p-2 rounded focus:outline-none focus:border-neon-blue">
                                    <option>成功联系，满意</option>
                                    <option>成功联系，一般</option>
                                    <option>成功联系，不满意</option>
                                    <option>无人接听</option>
                                    <option>号码错误</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-blue-300 mb-1">备注说明</label>
                                <textarea className="w-full h-20 bg-[#0b1730]/20 border border-blue-500/30 text-white text-xs p-2 rounded focus:outline-none focus:border-neon-blue resize-none"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-blue-500/30 bg-[#1e293b]/30">
                            <button onClick={() => setIsCallbackModalOpen(false)} className="px-3 py-1.5 text-xs text-gray-300 hover:text-white border border-transparent hover:border-gray-500 rounded">取消</button>
                            <button onClick={() => handleSaveCallbackResult({})} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm">保存</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Alert Toast */}
            {validationAlert.show && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-3 bg-blue-900/90 border border-blue-500/50 text-white rounded shadow-lg flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                    <span className="text-neon-blue"><CheckCircleIcon /></span>
                    <span className="text-sm">{validationAlert.message}</span>
                    <button onClick={() => setValidationAlert({show: false, message: ''})} className="text-gray-400 hover:text-white ml-2"><XIcon /></button>
                </div>
            )}
        </div>
    );
};
