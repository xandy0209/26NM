
import React, { useState, useRef, useEffect } from 'react';
import { ComplaintRecord, SubscriptionRecord } from '../types';
import { StyledButton, StyledSelect, StyledInput } from './UI';
import { RefreshCwIcon, PlusCircleIcon, CheckCircleIcon, EditIcon } from './Icons'; 
import { ServiceSelectionModal } from './ServiceSelectionModal';

interface Props {
  record: ComplaintRecord;
  targetTab?: 'basic' | 'flow' | 'process';
  triggerTimestamp?: number;
  onTabChange?: (tab: 'basic' | 'flow' | 'process') => void;
}

// Helper Components
const InfoItem = ({ label, value, span = 1, highlight = false, highlightColor, multiline = false }: any) => {
    let spanClass = 'col-span-1';
    if (span === 2) spanClass = 'col-span-2';
    if (span >= 3) spanClass = 'col-span-3';

    return (
        <div className={`${spanClass} flex ${multiline ? 'items-start' : 'items-baseline'}`}>
            <span className="text-sm text-white font-medium whitespace-nowrap mr-1">{label}：</span>
            <div className={`
                text-sm break-words flex-1
                ${highlight ? 'text-neon-blue font-bold' : 'text-white'}
                ${highlightColor ? highlightColor : ''}
            `}>
                {value || <span className="text-gray-500">-</span>}
            </div>
        </div>
    );
};

const FormRow = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="flex items-center gap-3">
        <label className="w-[80px] text-right text-xs text-white shrink-0">{label}</label>
        <div className="flex-1 min-w-0">
            {children}
        </div>
    </div>
);

const FlowChart = ({ stage }: { stage: string }) => {
    const steps = [
        { id: 'T0', label: '工单派发', aliases: ['待受理', 'T0'] },
        { id: 'T1', label: '工单处理', aliases: ['处理中', 'T1'] },
        { id: 'T2', label: '工单质检', aliases: ['待质检', 'T2'] },
        { id: 'Closed', label: '归档', aliases: ['已归档', 'Closed'] }
    ];
    
    const activeIndex = steps.findIndex(s => s.aliases.includes(stage));
    const isClosed = stage === 'Closed' || stage === '已归档';
    const currentIdx = isClosed ? 4 : activeIndex === -1 ? 0 : activeIndex;

    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.9); 
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    // Fix: Initialized dragStart with default coordinates as 'e' is not defined in this scope.
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const initialX = (containerWidth - 1000 * scale) / 2;
            setPosition({ x: initialX, y: 10 });
        }
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(scale + delta, 0.4), 2.5);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="relative w-full h-32 my-2 overflow-hidden group">
            <div 
                ref={containerRef}
                className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <div 
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: '1000px', 
                        height: '120px',
                    }}
                    className="relative transition-transform duration-75 ease-linear"
                >
                    <svg 
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
                        viewBox="0 0 1000 120" 
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill="#00d2ff" />
                            </marker>
                            <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
                            </marker>
                            <marker id="arrow-reject" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
                            </marker>
                        </defs>

                        {steps.map((_, idx) => {
                            if (idx === steps.length - 1) return null;
                            const isLineActive = idx < currentIdx;
                            const x1 = 125 + (idx * 250) + 66; 
                            const x2 = 125 + ((idx + 1) * 250) - 66; 
                            const y = 70; 

                            return (
                                <line 
                                    key={`line-${idx}`}
                                    x1={x1} y1={y} x2={x2} y2={y}
                                    stroke={isLineActive ? "#00d2ff" : "#334155"} 
                                    strokeWidth="1.5"
                                    markerEnd={`url(#arrow-${isLineActive ? 'blue' : 'gray'})`}
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}

                        <path 
                            d="M 625 48 L 625 20 L 375 20 L 375 43" 
                            fill="none" 
                            stroke="#94a3b8" 
                            strokeWidth="1.5" 
                            markerEnd="url(#arrow-reject)"
                            vectorEffect="non-scaling-stroke"
                        />
                        <rect x="480" y="12" width="40" height="16" fill="#0b1730" fillOpacity="0.9" />
                        <text x="500" y="24" fill="#94a3b8" fontSize="11" textAnchor="middle">驳回</text>
                    </svg>

                    {steps.map((step, idx) => {
                        const isActive = idx === currentIdx;
                        const isCompleted = idx < currentIdx;
                        
                        let bgClass = "bg-[#0b1730] border-gray-700 text-gray-500"; 
                        let glowClass = "";

                        if (isCompleted) {
                            bgClass = "bg-[#007acc]/20 border-[#007acc] text-blue-200"; 
                        }
                        if (isActive) {
                            bgClass = "bg-[#0b1730] text-neon-blue border-neon-blue font-bold"; 
                            glowClass = "shadow-[0_0_15px_rgba(0,210,255,0.4)]";
                        }

                        if (step.id === 'Closed' && isClosed) {
                             bgClass = "bg-[#007acc]/20 border-[#007acc] text-blue-200";
                             glowClass = ""; 
                        }
                        
                        const left = 125 + (idx * 250) - 65;
                        const top = 50;

                        return (
                            <div 
                                key={step.id} 
                                className="absolute flex flex-col items-center justify-center gap-2"
                                style={{ left: `${left}px`, top: `${top}px`, width: '130px', height: '40px' }}
                            >
                                <div className={`
                                    w-full h-full flex items-center justify-center border rounded-sm text-sm transition-all duration-300 select-none
                                    ${bgClass} ${glowClass}
                                `}>
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const generateLogs = (record: ComplaintRecord) => {
    const logs = [];
    const dispatchTime = record.complaintTime || '2026-01-11 06:30:48';
    const baseTime = new Date(dispatchTime.replace(' ', 'T')).getTime(); 
    
    logs.push({
        time: dispatchTime,
        opName: '派发',
        stage: '工单派发',
        operator: '系统自动 (10086)',
        info: `客户[${record.customerName}]来电报障，系统自动派单至[${record.assigneeCity}]`
    });

    if (record.stage !== 'T0' && record.stage !== '待受理') {
        const t1Time = new Date(baseTime + 300000).toISOString().replace('T', ' ').substring(0, 19);
        logs.push({
            time: t1Time,
            opName: '受理',
            stage: '工单处理',
            operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
            info: '已接单，准备前往现场排查'
        });

        if (['T2', 'Closed', '待质检', '已归档'].includes(record.stage)) {
            const t1DoneTime = new Date(baseTime + 1200000).toISOString().replace('T', ' ').substring(0, 19);
            logs.push({
                time: t1DoneTime,
                opName: '回单',
                stage: '工单处理',
                operator: `${record.assignee.split('-')[0]}张工 (13800138000)`,
                info: `故障已修复。原因：${record.faultType || '光缆故障'}。结果：${record.faultResult || '已修复'}`
            });
        }
    }

    if (record.stage === 'Closed' || record.stage === '已归档') {
        const t2Time = new Date(baseTime + 18000000).toISOString().replace('T', ' ').substring(0, 19);
        logs.push({
            time: t2Time,
            opName: '通过',
            stage: '工单质检',
            operator: '质检员李工 (13900139000)',
            info: '回访客户满意，工单归档'
        });
        
        const closeTime = new Date(baseTime + 18060000).toISOString().replace('T', ' ').substring(0, 19);
        logs.push({
            time: closeTime,
            opName: '系统归档',
            stage: '归档',
            operator: '系统自动',
            info: '流程结束'
        });
    }

    const opPriority: Record<string, number> = {
        '系统归档': 5,
        '通过': 4,
        '回单': 3,
        '受理': 2,
        '派发': 1
    };

    return logs.sort((a, b) => {
        const pA = opPriority[a.opName] || 0;
        const pB = opPriority[b.opName] || 0;
        return pB - pA;
    });
};

export const ComplaintDetailView: React.FC<Props> = ({ record, targetTab, triggerTimestamp, onTabChange }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'flow' | 'process'>('basic');
  const [currentStage, setCurrentStage] = useState(record.stage);

  useEffect(() => {
    if (targetTab) {
        setActiveTab(targetTab);
    }
  }, [triggerTimestamp, targetTab]); // Updated dependency to include targetTab for reliable updates
  
  const [businessInfo, setBusinessInfo] = useState({
      productType: record.productType,
      productInstance: record.productInstance,
      customerName: record.customerName,
      customerCode: record.customerCode,
      circuitCode: record.circuitCode,
      serviceAddressA: record.serviceAddressA,
      serviceAddressZ: record.serviceAddressZ
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const [replyData, setReplyData] = useState({
      faultResult: '',
      faultType: '',
      faultCause: ''
  });
  const [qcData, setQcData] = useState({
      qcResult: '',
      isSatisfied: '',
      qcRemarks: '',
      rejectReason: ''
  });

  useEffect(() => {
      setCurrentStage(record.stage);
      setReplyData({ faultResult: '', faultType: '', faultCause: '' });
      setQcData({ qcResult: '', isSatisfied: '', qcRemarks: '', rejectReason: '' });
      setBusinessInfo({
          productType: record.productType,
          productInstance: record.productInstance,
          customerName: record.customerName,
          customerCode: record.customerCode,
          circuitCode: record.circuitCode,
          serviceAddressA: record.serviceAddressA,
          serviceAddressZ: record.serviceAddressZ
      });
  }, [record]);

  const handleAccept = () => {
      setCurrentStage('处理中');
  };

  const handleReplySubmit = () => {
      setCurrentStage('待质检');
  };

  const handleQCSubmit = () => {
      if (qcData.qcResult === '通过') {
          setCurrentStage('已归档');
          setActiveTab('basic');
          if (onTabChange) onTabChange('basic');
      } else if (qcData.qcResult === '驳回') {
          setCurrentStage('处理中');
      }
  };

  const handleServiceUpdate = (sub: SubscriptionRecord) => {
    setBusinessInfo({
        productType: sub.serviceType,
        productInstance: sub.productInstance,
        customerName: sub.customerName,
        customerCode: sub.customerCode,
        circuitCode: sub.circuitCode,
        serviceAddressA: sub.addressA || '',
        serviceAddressZ: sub.serviceType === '数据专线' ? (sub.addressZ || '') : ''
    });
    setIsServiceModalOpen(false);
  };

  const tabs = [
      { id: 'basic', label: '基本信息' },
      { id: 'flow', label: '流转信息' }
  ];
  
  // Adjusted processing logic to handle Chinese status labels correctly
  const processingStages = ['T0', 'T1', 'T2', '待受理', '处理中', '待质检'];
  const canShowProcess = processingStages.includes(currentStage);
  
  if (canShowProcess) {
      tabs.push({ id: 'process', label: '工单处理' });
  }

  const displayRecord = { ...record, stage: currentStage as any };
  const logs = generateLogs(displayRecord);
  const currentDisplayTab = (activeTab === 'process' && !canShowProcess) ? 'basic' : activeTab;

  const handleTabClick = (tabId: 'basic' | 'flow' | 'process') => {
      setActiveTab(tabId);
      if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className="flex flex-col h-full bg-transparent backdrop-blur-sm text-blue-100 animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)]">
        <div className="flex items-end pt-4">
            <div className="w-6 border-b border-blue-500/20"></div>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as any)}
                    className={`
                        px-6 py-2 text-sm font-medium transition-all relative rounded-t-sm 
                        ${currentDisplayTab === tab.id 
                            ? 'text-neon-blue bg-transparent border-t border-l border-r border-blue-500/30 border-b-transparent z-10' 
                            : 'text-gray-400 border-b border-blue-500/20 hover:text-gray-200 hover:bg-white/5'}
                    `}
                >
                    {tab.label}
                </button>
            ))}
            <div className="flex-1 border-b border-blue-500/20"></div> 
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {currentDisplayTab === 'basic' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                            工单基本信息
                        </h3>
                        <div className="grid grid-cols-3 gap-4 bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm">
                            <InfoItem label="工单编号" value={displayRecord.ticketNo} />
                            <InfoItem label="工单状态" value={displayRecord.stage} />
                            <InfoItem label="工单来源" value={displayRecord.ticketSource || '客户来电'} />
                            <InfoItem label="派单时间" value={displayRecord.complaintTime} />
                            <InfoItem label="处理时限" value={displayRecord.slaDeadline} />
                            <InfoItem label="地市" value={displayRecord.assigneeCity} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2 flex items-center gap-2">
                            客户业务信息
                            {['处理中', '待质检', 'T1', 'T2'].includes(currentStage) && (
                                <button 
                                    onClick={() => setIsServiceModalOpen(true)}
                                    className="text-blue-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"
                                    title="修改业务信息"
                                >
                                    <EditIcon />
                                </button>
                            )}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm">
                            <InfoItem label="业务类型" value={businessInfo.productType} />
                            <InfoItem label="产品实例" value={businessInfo.productInstance} />
                            <InfoItem label="电路编号" value={businessInfo.circuitCode} />
                            <InfoItem label="客户名称" value={businessInfo.customerName} />
                            <InfoItem label="客户编号" value={businessInfo.customerCode} />
                            
                            {businessInfo.productType === '数据专线' ? (
                                <>
                                    <InfoItem label="A端地址" value={businessInfo.serviceAddressA} span={3} />
                                    <InfoItem label="Z端地址" value={businessInfo.serviceAddressZ} span={3} />
                                </>
                            ) : (
                                <InfoItem label="业务地址" value={businessInfo.serviceAddressA} span={3} />
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neon-blue mb-3 uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                            投诉信息
                        </h3>
                        <div className="grid grid-cols-3 gap-4 bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm">
                            <InfoItem label="故障时间" value={displayRecord.faultTime} />
                            <InfoItem label="投诉人" value={displayRecord.contactPerson} />
                            <InfoItem label="投诉人电话" value={displayRecord.contactPhone} />
                            <InfoItem label="投诉内容" value={displayRecord.complaintContent} span={3} multiline />
                            
                            {(displayRecord.stage === '已归档' || displayRecord.stage === 'Closed') && (
                                <>
                                    <div className="col-span-3 h-px bg-blue-500/20 my-2"></div>
                                    <InfoItem label="故障类型" value={displayRecord.faultType} />
                                    <InfoItem label="处理结果" value={displayRecord.faultResult} />
                                    <div className="col-span-1"></div>
                                    <InfoItem label="处理说明" value={displayRecord.faultCause} span={3} multiline />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {currentDisplayTab === 'flow' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="bg-blue-900/10 p-4 border border-blue-500/20 rounded-sm overflow-hidden">
                        <h4 className="text-xs font-bold text-blue-300 mb-2 uppercase">流程图</h4>
                        <FlowChart stage={displayRecord.stage} />
                    </div>
                    <div className="bg-blue-900/10 p-0 border border-blue-500/20 rounded-sm overflow-hidden">
                        <div className="px-4 py-2 border-b border-blue-500/20 bg-[#0c2242]/50">
                             <h4 className="text-xs font-bold text-blue-300 uppercase">流转日志</h4>
                        </div>
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0b1730] text-white">
                                <tr>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[160px]">处理时间</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[80px]">操作</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[100px]">环节</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10 w-[150px]">处理人</th>
                                    <th className="p-3 font-medium border-b border-blue-500/10">处理意见</th>
                                </tr>
                            </thead>
                            <tbody className="text-blue-100">
                                {logs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-blue-600/10 border-b border-blue-500/5 last:border-0">
                                        <td className="p-3 font-mono text-white whitespace-nowrap">{log.time}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`px-1.5 py-0.5 rounded-sm border ${
                                                log.opName === '派发' ? 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10' :
                                                log.opName === '受理' ? 'border-blue-500/30 text-blue-300 bg-blue-500/10' :
                                                log.opName === '回单' ? 'border-green-500/30 text-green-300 bg-green-500/10' :
                                                log.opName === '通过' ? 'border-purple-500/30 text-purple-300 bg-purple-500/10' :
                                                'border-gray-500/30 text-gray-300 bg-gray-500/10'
                                            }`}>
                                                {log.opName}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{log.stage}</td>
                                        <td className="p-3 text-white">{log.operator}</td>
                                        <td className="p-3 text-white">{log.info}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentDisplayTab === 'process' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] w-2/3 mx-auto">
                    {(currentStage === 'T0' || currentStage === '待受理') && (
                        <div className="bg-blue-900/10 p-6 border border-blue-500/20 rounded-sm space-y-4 min-h-[200px] flex flex-col">
                             <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                                工单受理
                            </h3>
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="text-blue-200 text-lg">当前工单处于 <span className="text-yellow-400 font-bold">待受理</span> 状态</div>
                                <StyledButton 
                                    variant="primary" 
                                    className="px-8 py-2 h-auto text-base"
                                    onClick={handleAccept}
                                    icon={<CheckCircleIcon />}
                                >
                                    立即受理
                                </StyledButton>
                            </div>
                        </div>
                    )}

                    {(currentStage === 'T1' || currentStage === '处理中') && (
                        <div className="bg-blue-900/10 p-6 border border-blue-500/20 rounded-sm space-y-4">
                            <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                                故障处理回单
                            </h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <FormRow label="故障类型">
                                    <StyledSelect 
                                        className="w-full"
                                        value={replyData.faultType}
                                        onChange={(e) => setReplyData({...replyData, faultType: e.target.value})}
                                    >
                                        <option value="">请选择</option>
                                        <option value="光缆故障">光缆故障</option>
                                        <option value="设备故障">设备故障</option>
                                        <option value="配置错误">配置错误</option>
                                        <option value="电力故障">电力故障</option>
                                        <option value="误报">误报</option>
                                    </StyledSelect>
                                </FormRow>
                                <FormRow label="处理结果">
                                    <StyledSelect 
                                        className="w-full"
                                        value={replyData.faultResult}
                                        onChange={(e) => setReplyData({...replyData, faultResult: e.target.value})}
                                    >
                                        <option value="">请选择</option>
                                        <option value="已修复">已修复</option>
                                        <option value="观察中">观察中</option>
                                        <option value="未发现异常">未发现异常</option>
                                    </StyledSelect>
                                </FormRow>
                                <div className="col-span-2 flex items-start gap-3">
                                    <label className="w-[80px] text-right text-xs text-white shrink-0 pt-1.5">处理说明</label>
                                    <textarea 
                                        className="flex-1 bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-24 resize-none leading-relaxed"
                                        value={replyData.faultCause}
                                        onChange={(e) => setReplyData({...replyData, faultCause: e.target.value})}
                                        placeholder="请详细描述故障处理过程及结果..."
                                    ></textarea>
                                </div>
                                <div className="col-span-2 flex justify-end gap-3 mt-2">
                                    <StyledButton variant="secondary">暂存</StyledButton>
                                    <StyledButton variant="primary" onClick={handleReplySubmit}>提交回单</StyledButton>
                                </div>
                            </div>
                        </div>
                    )}

                    {(currentStage === 'T2' || currentStage === '待质检') && (
                        <div className="bg-blue-900/10 p-6 border border-blue-500/20 rounded-sm space-y-4">
                            <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider border-l-2 border-neon-blue pl-2">
                                质检归档
                            </h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <FormRow label="质检结果">
                                    <StyledSelect 
                                        className="w-full"
                                        value={qcData.qcResult}
                                        onChange={(e) => setQcData({...qcData, qcResult: e.target.value})}
                                    >
                                        <option value="">请选择</option>
                                        <option value="通过">通过 (归档)</option>
                                        <option value="驳回">驳回 (重新处理)</option>
                                    </StyledSelect>
                                </FormRow>

                                {qcData.qcResult === '通过' && (
                                    <FormRow label="客户满意度">
                                        <StyledSelect 
                                            className="w-full"
                                            value={qcData.isSatisfied}
                                            onChange={(e) => setQcData({...qcData, isSatisfied: e.target.value})}
                                        >
                                            <option value="">请选择</option>
                                            <option value="满意">满意</option>
                                            <option value="基本满意">基本满意</option>
                                            <option value="不满意">不满意</option>
                                        </StyledSelect>
                                    </FormRow>
                                )}

                                <div className="col-span-2 flex items-start gap-3">
                                    <label className="w-[80px] text-right text-xs text-white shrink-0 pt-1.5">
                                        {qcData.qcResult === '驳回' ? '驳回原因' : '质检备注'}
                                    </label>
                                    <textarea 
                                        className="flex-1 bg-[#0f172a]/30 border border-[#0085D0]/50 text-blue-100 text-sm px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors rounded-none h-24 resize-none leading-relaxed"
                                        value={qcData.qcResult === '驳回' ? qcData.rejectReason : qcData.qcRemarks}
                                        onChange={(e) => qcData.qcResult === '驳回' 
                                            ? setQcData({...qcData, rejectReason: e.target.value})
                                            : setQcData({...qcData, qcRemarks: e.target.value})
                                        }
                                        placeholder={qcData.qcResult === '驳回' ? "请输入驳回原因..." : "请输入质检备注..."}
                                    ></textarea>
                                </div>
                                <div className="col-span-2 flex justify-end gap-3 mt-2">
                                    <StyledButton variant="primary" onClick={handleQCSubmit}>确认提交</StyledButton>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        <ServiceSelectionModal 
            isOpen={isServiceModalOpen}
            onClose={() => setIsServiceModalOpen(false)}
            onConfirm={handleServiceUpdate}
        />
    </div>
  );
};
