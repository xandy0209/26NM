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

// --- Types ---
interface CallbackItem {
    id: string;
    orderMonth: string;
    scenarioCategory: string;
    productName: string;
    city: string;
    customerName: string;
    customerCode: string;
    callbackPhone: string;
    status: 'pending' | 'completed';
    callFailed: boolean;
    callbackTime?: string;
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

    // Filter state for "Call Failed"
    const [isCallFailedFilterActive, setIsCallFailedFilterActive] = useState(false);

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
            customerCode: `C${8000 + (taskId * 10) + i}`,
            callbackPhone: `138${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            status: 'pending' as const,
            callFailed: false
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

    const handleToggleCallFailed = (id: string) => {
        setCallbackItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, callFailed: !item.callFailed };
            }
            return item;
        }));
    };

    const handleSaveCallbackResult = (resultData: any) => {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        setCallbackItems(prev => prev.map(item => {
            if (item.id === currentCallbackId) {
                return { ...item, status: 'completed', callbackTime: timestamp, ...resultData };
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

    const displayItems = callbackItems.filter(c => {
        const matchesTab = rightPanelSubTab === 'pending' ? c.status === 'pending' : c.status === 'completed';
        if (!matchesTab) return false;
        
        // Apply "Call Failed" filter only on pending tab if active
        if (rightPanelSubTab === 'pending' && isCallFailedFilterActive) {
            return c.callFailed;
        }
        
        return true;
    });

    return (
        <div className="flex h-full w-full bg-[#06264D]/50 p-[10px] text-white font-sans overflow-hidden relative">
            {/* Inner Content Wrapper */}
            <div className="flex h-full w-full bg-[#094F8B]/[0.03] overflow-hidden relative shadow-inner">

                {/* --- Left Sidebar --- */}
                <div 
                    className={`${isSidebarCollapsed ? 'w-[64px]' : 'w-[240px]'} bg-transparent border border-blue-500/30 flex flex-col shrink-0 transition-all duration-300`}
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
                                <div className="flex items-center justify-between mb-2 border-b border-blue-500/20 pb-2">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            className={`text-xs font-bold transition-colors relative ${rightPanelSubTab === 'pending' ? 'text-neon-blue pb-1' : 'text-gray-400 hover:text-white'}`}
                                            onClick={() => setRightPanelSubTab('pending')}
                                        >
                                            待回访清单 ({callbackItems.filter(c => c.status === 'pending').length})
                                            {rightPanelSubTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue" />}
                                        </button>
                                        <button 
                                            className={`text-xs font-bold transition-colors relative ${rightPanelSubTab === 'completed' ? 'text-neon-blue pb-1' : 'text-gray-400 hover:text-white'}`}
                                            onClick={() => setRightPanelSubTab('completed')}
                                        >
                                            已回访清单 ({callbackItems.filter(c => c.status === 'completed').length})
                                            {rightPanelSubTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue" />}
                                        </button>
                                    </div>
                                    {rightPanelSubTab === 'pending' && (
                                        <div className="flex items-center gap-1.5">
                                            <input 
                                                type="checkbox" 
                                                id="filter-fail"
                                                className="w-3.5 h-3.5 accent-red-500 cursor-pointer" 
                                                checked={isCallFailedFilterActive}
                                                onChange={() => setIsCallFailedFilterActive(!isCallFailedFilterActive)}
                                            />
                                            <label htmlFor="filter-fail" className={`text-[10px] cursor-pointer transition-colors ${isCallFailedFilterActive ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}>外呼失败</label>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-[10px]">
                                    {displayItems.length > 0 ? displayItems.map((item) => (
                                        <div key={item.id} className="grid grid-cols-2 gap-px bg-[#094F8B]/[0.03] border border-blue-500/20 rounded overflow-hidden transition-all duration-300">
                                            <InfoBox label="客户信息" value={`${item.customerName} (${item.customerCode})`} fullWidth />
                                            <InfoBox label="商品名称" value={item.productName} />
                                            <InfoBox label="场景类别" value={item.scenarioCategory} />
                                            <InfoBox label="地市" value={item.city} />
                                            <InfoBox label="电话" value={item.callbackPhone} />
                                            
                                            <div className={`p-2 border border-blue-500/20 bg-[#094F8B]/[0.03] flex items-center justify-between col-span-2 ${item.callFailed && rightPanelSubTab === 'pending' ? 'bg-red-500/10' : ''}`}>
                                                {rightPanelSubTab === 'pending' ? (
                                                    <>
                                                        <div className="flex items-center gap-1.5">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-3.5 h-3.5 accent-red-500 cursor-pointer" 
                                                                checked={item.callFailed}
                                                                onChange={() => handleToggleCallFailed(item.id)}
                                                            />
                                                            <div className={`text-[12px] whitespace-nowrap transition-colors ${item.callFailed ? 'text-red-400 font-medium' : 'text-gray-400'}`}>外呼失败</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleOpenCallbackModal(item.id)}
                                                            className="text-neon-blue underline text-xs hover:text-white"
                                                        >
                                                            回访结果录入
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="text-[11px] text-gray-400">回访时间: <span className="text-blue-200">{item.callbackTime || '2025-02-14 15:30:00'}</span></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-xs">
                                            <span>暂无{rightPanelSubTab === 'pending' ? '待' : '已'}回访记录</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-10 px-4 flex items-center justify-center gap-6 border-t border-blue-500/20 bg-[#094F8B]/[0.03]">
                                <button 
                                    onClick={handleCompleteTask}
                                    className="px-6 py-1.5 bg-[#07596C] text-white text-xs rounded hover:brightness-110 shadow-lg border border-[#00d2ff]/30 w-full"
                                >
                                    处理完成
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Callback Result Entry Modal (Absolute positioning within WorkbenchView) */}
            <CallbackResultModal 
                isOpen={isCallbackModalOpen} 
                onClose={() => setIsCallbackModalOpen(false)} 
                onSave={handleSaveCallbackResult}
            />

            {/* Validation Alert Modal */}
            {validationAlert.show && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]">
                    <div className="w-[300px] bg-[#0c2242] border border-blue-500/30 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden">
                        <div className="p-6 text-center text-sm">
                            {validationAlert.message}
                        </div>
                        <div className="flex justify-center p-3 border-t border-blue-500/20 bg-[#0b1730]/50">
                            <button 
                                onClick={() => setValidationAlert({ ...validationAlert, show: false })}
                                className="px-6 py-1.5 bg-[#07596C] text-white text-xs rounded hover:brightness-110"
                            >
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components ---

const CallbackResultModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void }) => {
    const [result, setResult] = useState('成功');
    const [satisfaction, setSatisfaction] = useState('');
    const [reason, setReason] = useState('');
    const [needVisit, setNeedVisit] = useState('');

    // Reset form when opened
    useEffect(() => {
        if (isOpen) {
            setResult('成功');
            setSatisfaction('');
            setReason('');
            setNeedVisit('');
        }
    }, [isOpen]);

    const handleSaveClick = () => {
        // Validation check
        if (result === '成功') {
            if (!satisfaction) { alert("请选择满意度"); return; }
            if (satisfaction !== '10' && !reason) { alert("请填写不满意原因"); return; }
            if (!needVisit) { alert("请选择是否需要上门"); return; }
            // Assuming "Recording" is always available/handled for mock purposes, skipping check or adding dummy check
        }

        onSave({ result, satisfaction, reason, needVisit });
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <div className="w-[500px] bg-[#0f172a] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="flex items-center justify-between px-6 py-3 bg-[#0c2242] border-b border-blue-500/30">
                    <span className="text-base font-bold text-white tracking-wide whitespace-nowrap">回访结果录入</span>
                    <button onClick={onClose} className="text-blue-400 hover:text-white transition-colors"><XIcon /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Call Result */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm text-blue-300 w-24 text-right whitespace-nowrap">
                            <span className="text-red-500 mr-1">*</span>外呼结果：
                        </label>
                        <div className="flex gap-4">
                            {['成功', '关机', '拒接'].map(r => (
                                <label key={r} className="flex items-center gap-1 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="result" 
                                        value={r} 
                                        checked={result === r} 
                                        onChange={(e) => setResult(e.target.value)}
                                        className="accent-neon-blue" 
                                    />
                                    <span className="text-sm">{r}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {result === '成功' && (
                        <>
                            {/* Satisfaction Score */}
                            <div className="flex items-start gap-4">
                                <label className="text-sm text-blue-300 w-24 text-right mt-1 whitespace-nowrap">
                                    <span className="text-red-500 mr-1">*</span>是否满意：
                                </label>
                                <div className="flex flex-wrap gap-2 flex-1">
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const score = (i + 1).toString();
                                        return (
                                            <label key={score} className={`
                                                flex items-center justify-center w-8 h-8 rounded border cursor-pointer text-xs transition-all
                                                ${satisfaction === score 
                                                    ? 'bg-neon-blue text-white border-neon-blue font-bold shadow-md' 
                                                    : 'bg-[#0b1730] border-blue-500/30 text-gray-300 hover:border-blue-400'}
                                            `}>
                                                <input 
                                                    type="radio" 
                                                    name="satisfaction" 
                                                    value={score} 
                                                    checked={satisfaction === score} 
                                                    onChange={(e) => setSatisfaction(e.target.value)}
                                                    className="hidden" 
                                                />
                                                {score}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reason - Only if NOT 10 */}
                            {satisfaction !== '10' && (
                                <div className="flex items-start gap-4">
                                    <label className="text-sm text-blue-300 w-24 text-right mt-1 whitespace-nowrap">
                                        <span className="text-red-500 mr-1">*</span>不满意原因：
                                    </label>
                                    <textarea 
                                        className="flex-1 bg-[#0b1730] border border-blue-500/30 text-white text-sm p-2 h-20 resize-none focus:outline-none focus:border-neon-blue"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="请输入不满意原因..."
                                    />
                                </div>
                            )}

                            {/* Need Visit */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-blue-300 w-24 text-right whitespace-nowrap">
                                    <span className="text-red-500 mr-1">*</span>是否需要上门：
                                </label>
                                <div className="flex gap-4">
                                    {['是', '否'].map(opt => (
                                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="visit" 
                                                value={opt} 
                                                checked={needVisit === opt} 
                                                onChange={(e) => setNeedVisit(e.target.value)}
                                                className="accent-neon-blue" 
                                            />
                                            <span className="text-sm">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Recording */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-blue-300 w-24 text-right whitespace-nowrap">
                                    <span className="text-red-500 mr-1">*</span>回访录音：
                                </label>
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-500 rounded bg-[#0b1730] cursor-pointer hover:border-blue-400 hover:text-blue-300 transition-colors">
                                        <CloudUploadIconOriginal />
                                        <span className="text-xs">点击上传录音文件</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-3 bg-[#0c2242] border-t border-blue-500/30">
                    <button onClick={onClose} className="px-4 py-1.5 border border-gray-500 text-gray-300 text-sm rounded hover:bg-white/5">取消</button>
                    <button onClick={handleSaveClick} className="px-4 py-1.5 bg-[#07596C] text-white text-sm rounded hover:brightness-110">保存</button>
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ label, count, active, collapsed }: { label: string, count: number, active: boolean, collapsed: boolean }) => (
    <div 
        className={`
            flex items-center cursor-pointer transition-all duration-200 relative
            ${collapsed 
                ? 'justify-center w-full py-3 bg-[#112240]/40 border border-blue-500/20 hover:border-blue-500/40 hover:bg-[#1e3a5f]/40' 
                : `justify-between px-3 py-3 bg-[#112240]/40 border border-blue-500/20 hover:border-blue-500/40 hover:bg-[#1e3a5f]/40 ${active ? 'border-l-2 border-l-neon-blue bg-[#1e3a5f]/60' : 'text-gray-400'}`
            }
        `} 
        title={collapsed ? label : ''}
    >
        {collapsed ? (
             <div className="flex items-center gap-1">
                 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px]">
                     {count > 0 ? count : 0}
                 </span>
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><polyline points="9 18 15 12 9 6"/></svg>
             </div>
        ) : (
            <>
                <span className="text-sm font-medium text-gray-200">{label}</span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${count > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700/50 text-gray-500'}`}>{count}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1" strokeWidth="1.5"/></svg>
                </div>
            </>
        )}
    </div>
);

const SubMenuItem = ({ label, count, active }: { label: string, count: number, active?: boolean }) => (
    <div className={`flex items-center justify-between px-8 py-2 cursor-pointer hover:bg-[#1e3a5f]/30 hover:text-white transition-colors ${active ? 'text-neon-blue' : 'text-gray-400'}`}>
        <span className="text-xs">{label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${count > 0 || active ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-500'}`}>{count}</span>
    </div>
);

const StatusCard = ({ label, count, active, onClick }: { label: string, count: string, active: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`
            relative flex items-center justify-center h-[30px] cursor-pointer transition-all duration-300 min-w-[100px] px-2 overflow-hidden
            ${active 
                ? 'z-10' 
                : 'border-t border-x border-blue-500/30 border-b-transparent hover:bg-blue-500/5 opacity-80 hover:opacity-100 bg-[#094F8B]/[0.05]'}
        `}
    >
        {active && (
            <>
                {/* Background Gradient - Top down fade */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#00d2ff]/10 to-transparent pointer-events-none" />

                {/* Top Highlight Line with Glow */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-neon-blue shadow-[0_0_10px_#00d2ff] pointer-events-none" />

                {/* Left Gradient Line - Top to Bottom fade */}
                <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />

                {/* Right Gradient Line - Top to Bottom fade */}
                <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-neon-blue via-neon-blue/50 to-transparent pointer-events-none" />

                {/* Bottom Glow Effect - Upward fade */}
                <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-gradient-to-t from-[#00d2ff]/30 to-transparent pointer-events-none" />
            </>
        )}

        <span className={`relative z-10 text-sm font-medium tracking-wide whitespace-nowrap ${active ? 'text-white font-bold' : 'text-gray-300'}`}>{label}</span>
        <span className={`relative z-10 ml-3 px-2 py-0.5 text-[10px] rounded-full shadow-sm ${active ? 'bg-[#ef4444] text-white' : 'bg-[#ef4444]/80 text-gray-200'}`}>{count}</span>
    </div>
);

const RightTab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-1.5 px-2 text-xs text-center rounded border transition-all duration-200 whitespace-nowrap ${active ? 'text-white border-[#007acc] bg-[#007acc]/40 shadow-[0_0_10px_rgba(0,122,204,0.3)]' : 'text-gray-400 border-blue-500/20 bg-[#112240]/40 hover:text-white hover:bg-[#1e3a5f]/60'}`}
    >
        {label}
    </button>
);

const InfoBox = ({ label, value, fullWidth = false }: { label: string, value: string, fullWidth?: boolean }) => (
    <div className={`p-2 border border-blue-500/20 bg-[#094F8B]/[0.03] ${fullWidth ? 'col-span-2' : ''} flex items-center`}>
        <div className="text-[12px] text-gray-400 whitespace-nowrap mr-1">{label}:</div>
        <div className="text-xs text-white truncate" title={value}>{value}</div>
    </div>
);
