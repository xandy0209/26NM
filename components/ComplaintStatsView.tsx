
import React, { useState, useMemo, useEffect } from 'react';
import { StyledButton, StyledSelect, StyledInput } from './UI';
import { Pagination } from './Pagination';
import { DownloadIcon, SearchIcon } from './Icons';
import { INNER_MONGOLIA_CITIES } from '../constants';

// Helper for table header cells
const Th = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`p-3 font-semibold border-b border-blue-500/40 whitespace-nowrap text-xs ${className}`} {...props}>
    {children}
  </th>
);

const businessCategories = ['专线', '5G专网', '物联网', '企宽'];
const serviceTypes = ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线'];
const faultTypes = ['光缆故障', '设备故障', '配置错误', '电力故障', '其他'];
const customers = ["腾讯科技", "阿里巴巴", "字节跳动", "工商银行", "招商银行", "国家电网", "蒙牛集团", "伊利集团", "内蒙古电力", "包钢集团"];

// --- Mock Data Generators ---

const generateVolumeData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        city: INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)].name,
        month: '2025-01',
        productType: businessCategories[Math.floor(Math.random() * businessCategories.length)],
        faultType: faultTypes[Math.floor(Math.random() * faultTypes.length)],
        count: Math.floor(Math.random() * 50) + 1
    }));
};

const generateTimelinessData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        city: INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)].name,
        month: '2025-01',
        productType: businessCategories[Math.floor(Math.random() * businessCategories.length)],
        rate: (Math.random() * 20 + 80).toFixed(2) + '%'
    }));
};

const generateRepeatedData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const category = businessCategories[Math.floor(Math.random() * businessCategories.length)];
        return {
            id: i,
            month: '2025-01',
            productType: category,
            serviceType: category === '专线' ? serviceTypes[Math.floor(Math.random() * serviceTypes.length)] : '',
            businessId: `209${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            count: Math.floor(Math.random() * 5) + 2,
            customerName: customers[Math.floor(Math.random() * customers.length)],
            customerCode: `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`
        };
    });
};

const generateAvailabilityData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const category = businessCategories[Math.floor(Math.random() * businessCategories.length)];
        return {
            id: i,
            month: '2025-01',
            productType: category,
            serviceType: category === '专线' ? serviceTypes[Math.floor(Math.random() * serviceTypes.length)] : '',
            businessId: `209${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            rate: (Math.random() * 5 + 95).toFixed(4) + '%',
            customerName: customers[Math.floor(Math.random() * customers.length)],
            customerCode: `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`
        };
    });
};

const MOCK_VOLUME = generateVolumeData(30);
const MOCK_TIMELINESS = generateTimelinessData(30);
const MOCK_REPEATED = generateRepeatedData(20);
const MOCK_AVAILABILITY = generateAvailabilityData(20);

export const ComplaintStatsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'volume' | 'timeliness' | 'repeated' | 'availability'>('volume');
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 15 });

    // State for filters
    const [subTabFilters, setSubTabFilters] = useState<Record<string, { month: string; productType: string; serviceType: string; city: string }>>({
        volume: { month: '2025-01', productType: '', serviceType: '', city: '' },
        timeliness: { month: '2025-01', productType: '', serviceType: '', city: '' },
        repeated: { month: '2025-01', productType: '', serviceType: '', city: '' },
        availability: { month: '2025-01', productType: '', serviceType: '', city: '' }
    });

    const [appliedFilters, setAppliedFilters] = useState<{ month: string; productType: string; serviceType: string; city: string }>({
        month: '2025-01', productType: '', serviceType: '', city: ''
    });

    const currentInputs = subTabFilters[activeTab] || { month: '2025-01', productType: '', serviceType: '', city: '' };

    const updateFilter = (key: string, value: string) => {
        setSubTabFilters(prev => ({
            ...prev,
            [activeTab]: { ...(prev[activeTab] || { month: '2025-01', productType: '', serviceType: '', city: '' }), [key]: value }
        }));
    };

    const handleSearch = () => {
        setPagination({ ...pagination, currentPage: 1 });
        setAppliedFilters(currentInputs);
    };

    useEffect(() => {
        setAppliedFilters(subTabFilters[activeTab] || { month: '2025-01', productType: '', serviceType: '', city: '' });
        setPagination({ ...pagination, currentPage: 1 });
    }, [activeTab]);

    const currentData = useMemo(() => {
        let data: any[] = [];
        switch (activeTab) {
            case 'volume': data = MOCK_VOLUME; break;
            case 'timeliness': data = MOCK_TIMELINESS; break;
            case 'repeated': data = MOCK_REPEATED; break;
            case 'availability': data = MOCK_AVAILABILITY; break;
            default: data = [];
        }

        if (appliedFilters.month) data = data.filter(item => item.month === appliedFilters.month);
        if (appliedFilters.productType) data = data.filter(item => item.productType === appliedFilters.productType);
        
        // Filter by serviceType for relevant tabs
        if ((activeTab === 'repeated' || activeTab === 'availability') && appliedFilters.serviceType) {
             data = data.filter(item => item.serviceType === appliedFilters.serviceType);
        }

        if (appliedFilters.city && (activeTab === 'volume' || activeTab === 'timeliness')) {
            data = data.filter(item => item.city === appliedFilters.city);
        }

        return data;
    }, [activeTab, appliedFilters]); 

    const paginatedData = currentData.slice((pagination.currentPage - 1) * pagination.pageSize, pagination.currentPage * pagination.pageSize);

    return (
        <div className="flex flex-col h-full bg-[#0b1730]/40 backdrop-blur-sm text-blue-100 animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-blue-500/30 shadow-[inset_0_0_20px_rgba(0,133,208,0.1)]">
            
            {/* Tabs */}
            <div className="flex items-end pt-4">
                <div className="w-6 border-b border-blue-500/30"></div>
                {[
                    { id: 'volume', label: '投诉量统计' },
                    { id: 'timeliness', label: '处理及时率统计' },
                    { id: 'repeated', label: '业务重复故障统计' },
                    { id: 'availability', label: '业务可用率统计' }
                ].map((tab, index) => (
                    <React.Fragment key={tab.id}>
                        {index > 0 && <div className="w-1 border-b border-blue-500/30"></div>}
                        <button
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                px-6 py-2 text-sm font-medium transition-all relative rounded-t-sm border-t border-l border-r border-b
                                ${activeTab === tab.id 
                                    ? 'text-neon-blue bg-transparent border-blue-500/30 border-b-transparent z-10' 
                                    : 'text-gray-400 border-t-transparent border-l-transparent border-r-transparent border-b-blue-500/30 hover:text-gray-200 hover:bg-white/5'}
                            `}
                        >
                            {tab.label}
                        </button>
                    </React.Fragment>
                ))}
                <div className="flex-1 border-b border-blue-500/30"></div>
            </div>

            {/* Filter Bar */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="bg-blue-900/10 p-3 border border-blue-500/20 rounded-sm mb-4 flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-white">月份</label>
                        <StyledInput 
                            type="month" 
                            className="w-[140px]" 
                            value={currentInputs.month}
                            onChange={(e) => updateFilter('month', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-white">业务分类</label>
                        <StyledSelect 
                            className="w-[120px]"
                            value={currentInputs.productType}
                            onChange={(e) => {
                                updateFilter('productType', e.target.value);
                                // Reset service type if category changes or is not private line
                                if(e.target.value !== '专线') updateFilter('serviceType', '');
                            }}
                        >
                            <option value="">全部</option>
                            {businessCategories.map(t => <option key={t} value={t}>{t}</option>)}
                        </StyledSelect>
                    </div>

                    {/* Service Type Filter - Only for Repeated and Availability tabs */}
                    { (activeTab === 'repeated' || activeTab === 'availability') && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-white">业务类型</label>
                            <StyledSelect 
                                className="w-[120px]"
                                value={currentInputs.serviceType}
                                onChange={(e) => updateFilter('serviceType', e.target.value)}
                                disabled={currentInputs.productType !== '专线'}
                            >
                                <option value="">全部</option>
                                {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </StyledSelect>
                        </div>
                    )}

                    {(activeTab === 'volume' || activeTab === 'timeliness') && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-white">地市</label>
                            <StyledSelect 
                                className="w-[120px]"
                                value={currentInputs.city}
                                onChange={(e) => updateFilter('city', e.target.value)}
                            >
                                <option value="">全部</option>
                                {INNER_MONGOLIA_CITIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                            </StyledSelect>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 ml-auto">
                         <StyledButton variant="toolbar" onClick={handleSearch} icon={<DownloadIcon />}>
                            导出
                        </StyledButton>
                        <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />}>
                            查询
                        </StyledButton>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto border border-blue-500/20 bg-[#0b1730]/20 scrollbar-thin">
                    <table className="w-full text-left text-sm whitespace-nowrap [&_th]:align-middle [&_td]:align-middle">
                        <thead className="sticky top-0 bg-[#0c2242] text-white z-10 shadow-sm">
                            <tr>
                                {activeTab === 'volume' && (
                                    <>
                                        <Th className="text-center">地市</Th>
                                        <Th className="text-center">月份</Th>
                                        <Th className="text-center">业务分类</Th>
                                        <Th className="text-center">故障类型</Th>
                                        <Th className="text-center">投诉单量</Th>
                                    </>
                                )}
                                {activeTab === 'timeliness' && (
                                    <>
                                        <Th className="text-center">地市</Th>
                                        <Th className="text-center">月份</Th>
                                        <Th className="text-center">业务分类</Th>
                                        <Th className="text-center">及时率</Th>
                                    </>
                                )}
                                {activeTab === 'repeated' && (
                                    <>
                                        <Th className="text-center">月份</Th>
                                        <Th className="text-center">业务分类</Th>
                                        <Th className="text-center">客户名称</Th>
                                        <Th className="text-center">客户编号</Th>
                                        <Th className="text-center">业务标识</Th>
                                        <Th className="text-center">业务类型</Th>
                                        <Th className="text-center">重复故障次数</Th>
                                    </>
                                )}
                                {activeTab === 'availability' && (
                                    <>
                                        <Th className="text-center">月份</Th>
                                        <Th className="text-center">业务分类</Th>
                                        <Th className="text-center">客户名称</Th>
                                        <Th className="text-center">客户编号</Th>
                                        <Th className="text-center">业务标识</Th>
                                        <Th className="text-center">业务类型</Th>
                                        <Th className="text-center">业务可用率</Th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item: any, idx) => (
                                    <tr key={item.id} className={`hover:bg-blue-600/10 transition-colors border-b border-blue-500/10 ${idx % 2 === 1 ? 'bg-[#015478]/20' : ''}`}>
                                        {activeTab === 'volume' && (
                                            <>
                                                <td className="p-2 text-center text-white">{item.city}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center text-white">{item.productType}</td>
                                                <td className="p-2 text-center text-white">{item.faultType}</td>
                                                <td className="p-2 text-center font-bold text-neon-blue">{item.count}</td>
                                            </>
                                        )}
                                        {activeTab === 'timeliness' && (
                                            <>
                                                <td className="p-2 text-center text-white">{item.city}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center text-white">{item.productType}</td>
                                                <td className="p-2 text-center font-bold text-neon-blue">{item.rate}</td>
                                            </>
                                        )}
                                        {activeTab === 'repeated' && (
                                            <>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center text-white">{item.productType}</td>
                                                <td className="p-2 text-center text-white">{item.customerName}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.customerCode}</td>
                                                <td className="p-2 text-center font-mono text-neon-blue">{item.businessId}</td>
                                                <td className="p-2 text-center text-white">{item.productType === '专线' ? item.serviceType : ''}</td>
                                                <td className="p-2 text-center font-bold text-yellow-400">{item.count}</td>
                                            </>
                                        )}
                                        {activeTab === 'availability' && (
                                            <>
                                                <td className="p-2 text-center font-mono text-white">{item.month}</td>
                                                <td className="p-2 text-center text-white">{item.productType}</td>
                                                <td className="p-2 text-center text-white">{item.customerName}</td>
                                                <td className="p-2 text-center font-mono text-white">{item.customerCode}</td>
                                                <td className="p-2 text-center font-mono text-neon-blue">{item.businessId}</td>
                                                <td className="p-2 text-center text-white">{item.productType === '专线' ? item.serviceType : ''}</td>
                                                <td className="p-2 text-center font-bold text-green-400">{item.rate}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-blue-300/50">暂无数据</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-[#1e293b]/50 border-t border-blue-500/30 shrink-0">
                    <Pagination 
                        currentPage={pagination.currentPage}
                        pageSize={pagination.pageSize}
                        totalItems={currentData.length}
                        onPageChange={(p) => setPagination({...pagination, currentPage: p})}
                        onPageSizeChange={(s) => setPagination({...pagination, pageSize: s, currentPage: 1})}
                    />
                </div>
            </div>
        </div>
    );
};
