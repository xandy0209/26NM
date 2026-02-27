
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

    return (
        <div className="flex h-full w-full items-center justify-center text-blue-300">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">工作台 (Workbench)</h2>
                <p>工作台内容正在开发中...</p>
            </div>
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
        <div className="text-[12px] text-white whitespace-nowrap mr-1">{label}:</div>
        <div className="text-xs text-gray-200 truncate" title={value}>{value}</div>
    </div>
);
