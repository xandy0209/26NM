
import React, { useState, useEffect } from 'react';
import { XIcon, SearchIcon } from './Icons';
import { StyledInput, StyledButton, StyledSelect } from './UI';
import { SubscriptionRecord } from '../types';
import { MOCK_SUBSCRIPTION_DATA, INNER_MONGOLIA_CITIES } from '../constants';
import { Pagination } from './Pagination';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: SubscriptionRecord) => void;
}

export const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    serviceType: '',
    city: ''
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<SubscriptionRecord[]>(MOCK_SUBSCRIPTION_DATA);
  const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 10
  });

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
        setFilteredData(MOCK_SUBSCRIPTION_DATA);
        setSelectedId(null);
        setFilters({ keyword: '', serviceType: '', city: '' });
        setPagination({ currentPage: 1, pageSize: 10 });
    }
  }, [isOpen]);

  const handleSearch = () => {
    const lowerKeyword = filters.keyword.toLowerCase();
    const lowerType = filters.serviceType.toLowerCase();

    const filtered = MOCK_SUBSCRIPTION_DATA.filter(item => {
        const matchKeyword = !filters.keyword || 
                             item.customerName.toLowerCase().includes(lowerKeyword) ||
                             item.customerCode.toLowerCase().includes(lowerKeyword) ||
                             item.productInstance.toLowerCase().includes(lowerKeyword) ||
                             (item.addressA && item.addressA.toLowerCase().includes(lowerKeyword)) || 
                             (item.addressZ && item.addressZ.toLowerCase().includes(lowerKeyword));
                             
        const matchType = !filters.serviceType || item.serviceType.toLowerCase().includes(lowerType);
        const matchCity = !filters.city || item.cityA === filters.city || item.cityZ === filters.city;
        
        return matchKeyword && matchType && matchCity;
    });
    setFilteredData(filtered);
    setSelectedId(null); // Clear selection on new search
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleConfirm = () => {
      if (selectedId) {
          const record = filteredData.find(r => r.id === selectedId);
          if (record) {
              onConfirm(record);
          }
      }
  };

  // Pagination Logic
  const paginatedData = filteredData.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#0b1730]/70 backdrop-blur-[2px]">
      {/* Container Background: Dark Space Blue #0b1730 */}
      <div className="w-[1100px] bg-[#0b1730] border border-blue-500/30 text-blue-100 font-sans shadow-[0_0_30px_rgba(0,133,208,0.2)] flex flex-col max-h-[55vh]">
        {/* Header: #0c2242/70 */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#0c2242]/70 border-b border-blue-500/30 shrink-0 h-[40px]">
          <span className="text-base font-bold text-white tracking-wide">投诉业务查询选择</span>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Search Bar: #13284c/30 */}
        <div className="p-4 bg-[#13284c]/30 border-b border-blue-500/10 flex items-center gap-3 shrink-0">
            <StyledInput 
                placeholder="客户名称/客户编号/产品实例/业务地址" 
                className="w-[350px]"
                value={filters.keyword}
                onChange={e => setFilters({...filters, keyword: e.target.value})}
            />
            <StyledSelect 
                className="w-[180px]"
                value={filters.serviceType}
                onChange={e => setFilters({...filters, serviceType: e.target.value})}
            >
                <option value="">所有业务类型</option>
                <option value="专线">专线</option>
                <option value="互联网">互联网</option>
                <option value="MPLS-VPN">MPLS-VPN</option>
                <option value="数据专线">数据专线</option>
            </StyledSelect>
            <StyledSelect 
                 className="w-[180px]"
                 value={filters.city}
                 onChange={e => setFilters({...filters, city: e.target.value})}
            >
                <option value="">所有业务地市</option>
                {INNER_MONGOLIA_CITIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                ))}
            </StyledSelect>
             <StyledButton variant="toolbar" onClick={handleSearch} icon={<SearchIcon />}>
                查询
            </StyledButton>
        </div>

        {/* Table List: #0b1730/50 */}
        <div className="flex-1 overflow-auto p-0 scrollbar-thin bg-[#0b1730]/50">
            {/* 
                Use border-separate to allow sticky headers to keep their borders.
                Sticky positioning on th elements ensures the header stays fixed including its border.
            */}
            <table className="w-full text-left border-separate border-spacing-0 text-xs">
                <thead className="text-blue-100">
                    <tr>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">客户名称</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">客户编号</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">业务类型</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">产品实例</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">电路代号</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">A端地市</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">A端地址</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">Z端地市</th>
                        <th className="sticky top-0 z-10 bg-[#0c2242] p-3 border-b border-blue-500/30 font-semibold whitespace-nowrap shadow-sm">Z端地址</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, idx) => {
                            const isDataLine = row.serviceType === '数据专线';
                            
                            return (
                            <tr 
                                key={row.id}
                                onClick={() => setSelectedId(row.id)}
                                className={`
                                    cursor-pointer transition-colors border-b border-blue-500/10
                                    ${selectedId === row.id ? 'bg-[#007acc]/60' : 'hover:bg-blue-500/10'}
                                    ${idx % 2 === 1 && selectedId !== row.id ? 'bg-[#13284c]/40' : ''}
                                `}
                            >
                                <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.customerName}</td>
                                <td className="p-3 text-blue-300 border-r border-blue-500/5 border-b border-blue-500/10">{row.customerCode}</td>
                                <td className="p-3 text-blue-200 border-r border-blue-500/5 border-b border-blue-500/10">{row.serviceType}</td>
                                <td className="p-3 font-mono text-neon-blue border-r border-blue-500/5 border-b border-blue-500/10">{row.productInstance}</td>
                                <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.circuitCode}</td>
                                <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{row.cityA}</td>
                                <td className="p-3 text-gray-300 border-r border-blue-500/5 border-b border-blue-500/10 max-w-[150px] truncate" title={row.addressA}>{row.addressA}</td>
                                <td className="p-3 text-white border-r border-blue-500/5 border-b border-blue-500/10">{isDataLine ? row.cityZ : '-'}</td>
                                <td className="p-3 text-gray-300 border-b border-blue-500/10 max-w-[150px] truncate" title={isDataLine ? row.addressZ : ''}>{isDataLine ? row.addressZ : '-'}</td>
                            </tr>
                        )})
                    ) : (
                        <tr>
                            <td colSpan={9} className="p-8 text-center text-blue-300/60 border-b border-blue-500/10">暂无数据</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Bar: #0c2242/40 (No top border) */}
        <div className="bg-[#0c2242]/40 shrink-0 h-[40px] flex items-center">
             <div className="w-full px-4">
                 <Pagination 
                     currentPage={pagination.currentPage}
                     pageSize={pagination.pageSize}
                     totalItems={filteredData.length}
                     onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                     onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))}
                     className="py-0 px-0 w-full"
                 />
             </div>
        </div>

        {/* Action Bar (Footer): #0c2242/70 */}
        <div className="flex items-center justify-end gap-3 px-6 py-2 bg-[#0c2242]/70 border-t border-blue-500/30 shrink-0">
            <span className="text-xs text-blue-300 mr-auto">
                {selectedId ? '已选择 1 条记录' : '请点击列表选择一条记录'}
            </span>
            <StyledButton variant="secondary" onClick={onClose}>
                取消
            </StyledButton>
            <StyledButton variant="primary" onClick={handleConfirm} disabled={!selectedId} className="disabled:opacity-50 disabled:cursor-not-allowed">
                确认选择
            </StyledButton>
        </div>
      </div>
    </div>
  );
};
