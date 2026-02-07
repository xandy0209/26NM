
import { OtnRecord, SpnRecord, InternetRecord, AlarmRecord, IplRecord, MplsRecord, IgplRecord, RouteCityRecord, RouteRecord, SubscriptionRecord, ComplaintRecord } from './types';

// Helper to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Mock data pools for Circuit Codes
const locations = [
  "通辽市科区新局", "科尔沁新奥燃气", 
  "呼和浩特市移动二枢纽", "新城恒泰证券专", 
  "呼和浩特市", "锡林郭勒盟", 
  "乌海市乌海综合楼", "海勃湾千钢工业园",
  "包头市昆区电信大楼", "东河区铝业工业园",
  "赤峰市红山区政府", "松山区物流园区",
  "鄂尔多斯东胜区", "康巴什新区数据中心"
];

const codeTypes = ["30N", "FE"];
const codeSuffixes = ["KA/P", "KA", "NP/P", "ZA"];

// UPDATE: Strictly Inner Mongolia Cities for system simulation
const cities = [
  '呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', 
  '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', 
  '兴安盟', '锡林郭勒盟', '阿拉善盟'
];

export const INNER_MONGOLIA_CITIES = [
  { name: '呼和浩特市', code: '471' },
  { name: '包头市', code: '472' },
  { name: '乌海市', code: '473' },
  { name: '赤峰市', code: '476' },
  { name: '通辽市', code: '475' },
  { name: '鄂尔多斯市', code: '477' },
  { name: '呼伦贝尔市', code: '470' },
  { name: '巴彦淖尔市', code: '478' },
  { name: '乌兰察布市', code: '474' },
  { name: '兴安盟', code: '482' },
  { name: '锡林郭勒盟', code: '479' },
  { name: '阿拉善盟', code: '483' },
];

// Realistic Address Data for Inner Mongolia and common external cities
const ADDRESS_DATA: Record<string, { districts: string[], roads: string[] }> = {
    '呼和浩特市': {
        districts: ['赛罕区', '新城区', '回民区', '玉泉区'],
        roads: ['新华东街', '呼伦贝尔南路', '鄂尔多斯大街', '中山西路', '成吉思汗大街', '大学西路', '锡林郭勒南路', '昭乌达路', '敕勒川大街']
    },
    '包头市': {
        districts: ['昆都仑区', '东河区', '青山区', '九原区'],
        roads: ['钢铁大街', '阿尔丁大街', '巴彦塔拉大街', '建设路', '友谊大街', '富强路', '民族东路', '少先路']
    },
    '鄂尔多斯市': {
        districts: ['东胜区', '康巴什区', '伊金霍洛旗'],
        roads: ['鄂尔多斯西街', '伊金霍洛西街', '天骄路', '那达慕街', '乌兰木伦街', '准格尔路', '达拉特南路']
    },
    '赤峰市': {
        districts: ['红山区', '松山区', '元宝山区'],
        roads: ['哈达街', '英金路', '昭乌达路', '玉龙大街', '钢铁西街', '桥北新区', '临潢大街']
    },
    '通辽市': {
        districts: ['科尔沁区'],
        roads: ['建国路', '明仁大街', '霍林河大街', '和平路', '交通路', '胜利北路']
    },
    '乌海市': {
        districts: ['海勃湾区', '乌达区', '海南区'],
        roads: ['海拉尔街', '新华大街', '建设路', '滨河大道', '人民路']
    },
    '呼伦贝尔市': {
        districts: ['海拉尔区', '满洲里市'],
        roads: ['满洲里路', '阿里河路', '中央街', '胜利大街', '伊敏大街']
    },
    '巴彦淖尔市': {
        districts: ['临河区'],
        roads: ['胜利北路', '解放街', '新华街', '金川大道', '河套大街']
    },
    '乌兰察布市': {
        districts: ['集宁区'],
        roads: ['恩和路', '怀远大街', '民建大街', '工农路', '察哈尔东街']
    },
    '兴安盟': {
        districts: ['乌兰浩特市'],
        roads: ['兴安北路', '五一北路', '罕山中街']
    },
    '锡林郭勒盟': {
        districts: ['锡林浩特市'],
        roads: ['锡林大街', '南京路', '额尔敦路']
    },
    '阿拉善盟': {
        districts: ['阿拉善左旗'],
        roads: ['额鲁特西路', '土尔扈特南路', '雅布赖路']
    },
};

// Helper to generate common fields
const generateCommonFields = (i: number, type: string) => {
    // 1. Product Instance: 209 + 8 random digits
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const productInstance = `209${randomSuffix}`; 
    
    // 2. Circuit Code
    const locA = locations[Math.floor(Math.random() * locations.length)];
    let locZ = locations[Math.floor(Math.random() * locations.length)];
    while (locA === locZ) {
        locZ = locations[Math.floor(Math.random() * locations.length)];
    }
    const codeType = codeTypes[Math.floor(Math.random() * codeTypes.length)];
    const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const suffix = codeSuffixes[Math.floor(Math.random() * codeSuffixes.length)];
    const circuitCode = `${locA}-${locZ}${codeType}${num}${suffix}`;

    const cityA = cities[i % cities.length];
    const cityZ = cities[(i + 1) % cities.length];
    const lineName = `${cityA}-${cityZ}-${type}-专线-${i}`;
    
    // Time
    const date = new Date();
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440));
    const timeStr = date.toISOString().replace('T', ' ').substring(0, 19);

    return { productInstance, circuitCode, lineName, cityA, cityZ, timeStr };
};

// Generate Mock Data for OTN
export const generateMockData = (count: number): OtnRecord[] => {
  const data: OtnRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const { productInstance, circuitCode, lineName, cityA, cityZ, timeStr } = generateCommonFields(i, 'OTN');

    // Metrics
    const latency = (Math.random() * 50 + 2).toFixed(2);
    const jitter = (Math.random() * 5).toFixed(3);
    const rxLoss = (Math.random() * 0.01).toFixed(4);
    const txLoss = (Math.random() * 0.01).toFixed(4);
    
    // Traffic
    const rxBytes = Math.floor(Math.random() * 10000000000);
    const txBytes = Math.floor(Math.random() * 10000000000);
    const utilRx = (Math.random() * 90).toFixed(2);
    const utilTx = (Math.random() * 90).toFixed(2);

    // NE Info
    const aNe = `${cityA}-OTN-NE-${Math.floor(Math.random() * 100)}`;
    const zNe = `${cityZ}-OTN-NE-${Math.floor(Math.random() * 100)}`;
    const portA = `Port-${Math.floor(Math.random() * 16)}`;
    const portZ = `Port-${Math.floor(Math.random() * 16)}`;
    const slotA = `Slot-${Math.floor(Math.random() * 8)}`;
    const slotZ = `Slot-${Math.floor(Math.random() * 8)}`;

    data.push({
        id: `otn-${i}`,
        productInstance,
        lineName,
        circuitCode,
        latency,
        jitter,
        rxPacketLossRate: rxLoss + '%',
        txPacketLossRate: txLoss + '%',
        rxTotalBytes: formatNumber(rxBytes),
        txTotalBytes: formatNumber(txBytes),
        rxMaxBandwidthUtil: utilRx + '%',
        txMaxBandwidthUtil: utilTx + '%',
        
        aNe,
        aNePort: portA,
        aSlot: slotA,
        aServiceRxPackets: formatNumber(Math.floor(rxBytes / 1500)),
        aServiceRxBytes: formatNumber(rxBytes),
        aServiceRxDrop: Math.floor(Math.random() * 100).toString(),
        aServiceTxPackets: formatNumber(Math.floor(txBytes / 1500)),
        aServiceTxDrop: Math.floor(Math.random() * 100).toString(),
        aPreFecBer: (Math.random() * 1e-6).toExponential(2),
        aPostFecBer: (Math.random() * 1e-12).toExponential(2),
        
        zNe,
        zNePort: portZ,
        zSlot: slotZ,
        zServiceRxPackets: formatNumber(Math.floor(txBytes / 1500)), 
        zServiceRxBytes: formatNumber(txBytes),
        zServiceRxDrop: Math.floor(Math.random() * 100).toString(),
        zServiceTxPackets: formatNumber(Math.floor(rxBytes / 1500)),
        zServiceTxBytes: formatNumber(rxBytes),
        zServiceTxDrop: Math.floor(Math.random() * 100).toString(),
        zPreFecBer: (Math.random() * 1e-6).toExponential(2),
        zPostFecBer: (Math.random() * 1e-12).toExponential(2),
        
        metricTime: timeStr
    });
  }

  return data;
};

// Generate Mock Data for SPN
export const generateSpnMockData = (count: number): SpnRecord[] => {
    const data: SpnRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, lineName, cityA, cityZ, timeStr } = generateCommonFields(i, 'SPN');
        
        // General Metrics
        const avgBw = (Math.random() * 60 + 10).toFixed(2);
        const peakBw = (parseFloat(avgBw) + Math.random() * 20).toFixed(2);
        const loss = (Math.random() * 0.005).toFixed(4);
        const lat = (Math.random() * 30 + 1).toFixed(2);
        const jit = (Math.random() * 3).toFixed(3);
        const upAvg = (parseFloat(avgBw) * (0.8 + Math.random() * 0.4)).toFixed(2);
        const downAvg = (parseFloat(avgBw) * (0.8 + Math.random() * 0.4)).toFixed(2);

        // PW Metrics (Simulating slightly different values for A and Z ends)
        const generatePwMetrics = () => {
             const rxB = Math.floor(Math.random() * 5000000000);
             const txB = Math.floor(Math.random() * 5000000000);
             return {
                 rxPkts: formatNumber(Math.floor(rxB / 1200)),
                 rxBytes: formatNumber(rxB),
                 txPkts: formatNumber(Math.floor(txB / 1200)),
                 txBytes: formatNumber(txB),
                 lat: (parseFloat(lat) + Math.random() - 0.5).toFixed(2),
                 jit: (parseFloat(jit) + Math.random() * 0.5).toFixed(3),
                 loss: (Math.random() * 0.001).toFixed(5),
                 utilAvg: (parseFloat(avgBw) + Math.random() * 5 - 2.5).toFixed(2),
                 utilMax: (parseFloat(peakBw) + Math.random() * 5 - 2.5).toFixed(2)
             };
        };

        const aMetrics = generatePwMetrics();
        const zMetrics = generatePwMetrics();

        data.push({
            id: `spn-${i}`,
            productInstance,
            lineName,
            circuitCode,
            avgBandwidthUtil: avgBw + '%',
            peakBandwidthUtil: peakBw + '%',
            packetLossRate: loss + '%',
            latency: lat,
            jitter: jit,
            upAvgBandwidthUtil: upAvg + '%',
            downAvgBandwidthUtil: downAvg + '%',

            aNe: `${cityA}-SPN-Access-${Math.floor(Math.random() * 50)}`,
            aPwRxPackets: aMetrics.rxPkts,
            aPwRxBytes: aMetrics.rxBytes,
            aPwTxPackets: aMetrics.txPkts,
            aPwTxBytes: aMetrics.txBytes,
            aPwLatency: aMetrics.lat,
            aPwJitter: aMetrics.jit,
            aPwLossRate: aMetrics.loss + '%',
            aPwBandwidthUtilAvg: aMetrics.utilAvg + '%',
            aPwBandwidthUtilMax: aMetrics.utilMax + '%',

            zNe: `${cityZ}-SPN-Access-${Math.floor(Math.random() * 50)}`,
            zPwRxPackets: zMetrics.rxPkts,
            zPwRxBytes: zMetrics.rxBytes,
            zPwTxPackets: zMetrics.txPkts,
            zPwTxBytes: zMetrics.txBytes,
            zPwLatency: zMetrics.lat,
            zPwJitter: zMetrics.jit,
            zPwLossRate: zMetrics.loss + '%',
            zPwBandwidthUtilAvg: zMetrics.utilAvg + '%',
            zPwBandwidthUtilMax: zMetrics.utilMax + '%',

            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for Internet
export const generateInternetMockData = (count: number): InternetRecord[] => {
    const data: InternetRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, lineName, timeStr } = generateCommonFields(i, 'Internet');
        
        // Traffic Data
        const upBytes = Math.floor(Math.random() * 50000000000);
        const downBytes = Math.floor(Math.random() * 80000000000); // Typically downlink > uplink
        
        const upRate = (Math.random() * 100 + 10).toFixed(2); // Mbps
        const downRate = (Math.random() * 200 + 20).toFixed(2); // Mbps
        
        const upUtil = (Math.random() * 80).toFixed(2);
        const downUtil = (Math.random() * 90).toFixed(2);
        
        // Quality Metrics
        const lat = (Math.random() * 40 + 5).toFixed(2);
        const jit = (Math.random() * 10).toFixed(3);
        const loss = (Math.random() * 0.1).toFixed(4);

        data.push({
            id: `net-${i}`,
            productInstance,
            lineName,
            circuitCode,
            uplinkBytes: formatNumber(upBytes),
            downlinkBytes: formatNumber(downBytes),
            uplinkAvgRate: upRate + ' Mbps',
            downlinkAvgRate: downRate + ' Mbps',
            uplinkAvgBandwidthUtil: upUtil + '%',
            downlinkAvgBandwidthUtil: downUtil + '%',
            latency: lat,
            jitter: jit,
            avgPacketLossRate: loss + '%',
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for Alarm
export const generateAlarmMockData = (count: number): AlarmRecord[] => {
    const data: AlarmRecord[] = [];
    const ownerIds = ['移动侧', '客户侧'];
    const businessTypes = ['国际政企专线', 'MPLS-VPN', '省内数据专线', '互联网专线'];
    const alarmTitles = ['ETH_LOS', 'FIBER_CUT', 'POWER_OFF', 'R_LOS', 'OSC_RDI', 'TEMP_HIGH', 'FAN_FAIL', 'MODULE_OFFLINE'];
    const vendors = ['Huawei', 'ZTE', 'FiberHome', 'Nokia'];
    const customers = ['Tencent', 'Alibaba', 'ByteDance', 'ICBC', 'CMB', 'State Grid'];
    const assuranceLevels = ['Gold', 'Silver', 'Copper', 'Standard', 'Diamond'];
    const clearStatuses = ['已清除', '未清除'];
    const logicCategories = ['传输类', '数据类', '环境类', '设备类'];
    const neTypes = ['PTN', 'OTN', 'SDH', 'Router', 'Switch'];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, cityA, timeStr } = generateCommonFields(i, 'Alarm');
        
        const ownerId = ownerIds[Math.floor(Math.random() * ownerIds.length)];
        const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
        const neName = `${cityA}-${neTypes[Math.floor(Math.random() * neTypes.length)]}-${Math.floor(Math.random() * 1000)}`;
        const clearStatus = clearStatuses[Math.floor(Math.random() * clearStatuses.length)];
        
        // Date manipulation for event and clear time
        const eventDate = new Date();
        eventDate.setHours(eventDate.getHours() - Math.floor(Math.random() * 48));
        const eventTime = eventDate.toISOString().replace('T', ' ').substring(0, 19);
        
        let clearTime = '';
        if (clearStatus === '已清除') {
             const clearDate = new Date(eventDate);
             clearDate.setMinutes(clearDate.getMinutes() + Math.floor(Math.random() * 120) + 1);
             clearTime = clearDate.toISOString().replace('T', ' ').substring(0, 19);
        }

        data.push({
            id: `alarm-${i}`,
            ownerId: ownerId,
            alarmGlobalId: `ALM-${Math.floor(Math.random() * 1000000000)}`,
            neName: neName,
            neType: neTypes[Math.floor(Math.random() * neTypes.length)],
            alarmObject: `${neName}-Port-${Math.floor(Math.random() * 16)}`,
            alarmObjectName: `GigabitEthernet0/0/${Math.floor(Math.random() * 16)}`,
            alarmObjectType: 'Physical Port',
            eventTime: eventTime,
            clearTime: clearTime,
            alarmTitle: alarmTitles[Math.floor(Math.random() * alarmTitles.length)],
            vendor: vendors[Math.floor(Math.random() * vendors.length)],
            alarmText: `Detected signal loss on interface ${Math.floor(Math.random() * 10)}`,
            clearStatus: clearStatus,
            activeAlarmCount: '1',
            neAlias: `${cityA} Core Site`,
            province: cityA, // Simplifying to map city to province
            alarmRegion: cityA,
            county: `${cityA} District`,
            circuitCode: circuitCode,
            proCategory1: 'Transmission',
            proCategory2: 'Optical',
            logicCategory: logicCategories[Math.floor(Math.random() * logicCategories.length)],
            logicSubCategory: 'Communication Quality',
            engineeringStatus: 'In Service',
            customerName: customers[Math.floor(Math.random() * customers.length)],
            customerCode: `CUST-${Math.floor(Math.random() * 100000)}`,
            productInstance: productInstance,
            serviceAssuranceLevel: assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)],
            businessType: businessType
        });
    }
    return data;
}

// Generate Mock Data for IPL
export const generateIplMockData = (count: number): IplRecord[] => {
    const data: IplRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, timeStr } = generateCommonFields(i, 'IPL');
        const latency = (Math.random() * 120 + 20).toFixed(2);
        
        data.push({
            id: `ipl-${i}`,
            productInstance,
            circuitCode,
            latency,
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for MPLS
export const generateMplsMockData = (count: number): MplsRecord[] => {
    const data: MplsRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, timeStr } = generateCommonFields(i, 'MPLS');
        
        const rxRate = Math.floor(Math.random() * 1000000000); // Up to 1 Gbps
        const txRate = Math.floor(Math.random() * 1000000000); // Up to 1 Gbps

        data.push({
            id: `mpls-${i}`,
            productInstance,
            rxRate: formatNumber(rxRate),
            txRate: formatNumber(txRate),
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for IGPL (International Government/Enterprise Private Line)
export const generateIgplMockData = (count: number): IgplRecord[] => {
    const data: IgplRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, timeStr } = generateCommonFields(i, 'IGPL');
        
        const rxLoss = (Math.random() * 0.05).toFixed(4);
        const txLoss = (Math.random() * 0.05).toFixed(4);
        const rxBytes = Math.floor(Math.random() * 50000000000);
        const txBytes = Math.floor(Math.random() * 50000000000);
        const rxUtil = (Math.random() * 85).toFixed(2);
        const txUtil = (Math.random() * 85).toFixed(2);

        data.push({
            id: `igpl-${i}`,
            productInstance,
            circuitCode,
            rxPacketLossRate: rxLoss + '%',
            txPacketLossRate: txLoss + '%',
            rxTotalBytes: formatNumber(rxBytes),
            txTotalBytes: formatNumber(txBytes),
            rxMaxBandwidthUtil: rxUtil + '%',
            txMaxBandwidthUtil: txUtil + '%',
            metricTime: timeStr
        });
    }

    return data;
}

// Generate Mock Data for Route City
export const generateRouteCityMockData = (count: number): RouteCityRecord[] => {
    const data: RouteCityRecord[] = [];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode } = generateCommonFields(i, 'Route');
        const cityInfo = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
        
        data.push({
            id: `route-${i}`,
            productInstance,
            circuitCode,
            primaryBackupFlag: Math.random() > 0.5 ? '主' : '备',
            routeSequence: Math.floor(Math.random() * 20 + 1).toString(),
            cityCode: cityInfo.code,
            cityName: cityInfo.name
        });
    }
    return data;
}

// Generate Mock Data for Route
export const generateRouteMockData = (count: number): RouteRecord[] => {
    const data: RouteRecord[] = [];
    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, cityA } = generateCommonFields(i, 'Route');
        data.push({
            id: `route-info-${i}`,
            circuitCode,
            productInstance,
            primaryBackupFlag: Math.random() > 0.5 ? '主' : '备',
            routeSequence: Math.floor(Math.random() * 20 + 1).toString(),
            portId: `PID-${Math.floor(Math.random() * 100000)}`,
            portName: `GE-${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 20)}`,
            deviceId: `DID-${Math.floor(Math.random() * 100000)}`,
            deviceName: `${cityA}-NE-${Math.floor(Math.random() * 999)}`
        });
    }
    return data;
}

// Helper to pick a random item from a city's address data
const getRandomAddress = (cityName: string) => {
    // Default to Hohhot if city data missing
    const addrData = ADDRESS_DATA[cityName] || ADDRESS_DATA['呼和浩特市'];
    const district = addrData.districts[Math.floor(Math.random() * addrData.districts.length)];
    const road = addrData.roads[Math.floor(Math.random() * addrData.roads.length)];
    const address = `${road}${Math.floor(Math.random() * 900 + 1)}号`;
    return { district, address };
};

// Generate Mock Data for Subscription
export const generateSubscriptionMockData = (count: number): SubscriptionRecord[] => {
    const data: SubscriptionRecord[] = [];
    const serviceTypes = ["数据专线", "MPLS-VPN专线", "互联网专线"];
    const serviceLevels = ["跨境", "跨省", "跨地市", "本地"];
    const assuranceLevels = ["AAA", "AA", "A", "普通"];
    const statuses = ["正常", "停机", "测试"];
    const accessTypes = ["光纤直连", "GPON", "微波", "PTN接入"];
    const customers = ["腾讯科技", "阿里巴巴", "字节跳动", "工商银行", "招商银行", "国家电网", "蒙牛集团", "伊利集团"];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode } = generateCommonFields(i, 'Sub');
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const serviceLevel = serviceLevels[Math.floor(Math.random() * serviceLevels.length)];
        const bandwidth = [10, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 6)] + 'M';
        const customerName = customers[Math.floor(Math.random() * customers.length)];
        const customerCode = `CUST-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
        
        // A End - Usually in Inner Mongolia for this system context
        const cityAObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
        const provinceA = "内蒙古自治区";
        const cityA = cityAObj.name;
        const { district: districtA, address: addressA } = getRandomAddress(cityA);
        const accessTypeA = accessTypes[Math.floor(Math.random() * accessTypes.length)];

        // Z End - Strictly simulated within Inner Mongolia for this requirement
        let provinceZ = "内蒙古自治区";
        let cityZ = "";
        let districtZ = "";
        let addressZ = "";
        const accessTypeZ = accessTypes[Math.floor(Math.random() * accessTypes.length)];

        if (serviceLevel === '本地') {
            cityZ = cityA;
            // Pick address, possibly same district or different
            const zAddrData = getRandomAddress(cityZ);
            districtZ = zAddrData.district;
            addressZ = zAddrData.address;
        } else {
            // For '跨地市', '跨省', '跨境', we simulate using another IM city to satisfy the system constraint
            // while keeping the business label for variety.
            let cityZObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
            // Ensure different city if possible
            while(cityZObj.name === cityA) {
                 cityZObj = INNER_MONGOLIA_CITIES[Math.floor(Math.random() * INNER_MONGOLIA_CITIES.length)];
            }
            cityZ = cityZObj.name;
            const zAddrData = getRandomAddress(cityZ);
            districtZ = zAddrData.district;
            addressZ = zAddrData.address;

            // Only override province string if strictly necessary, but user said "System cities only simulate IM".
            // So we keep ProvinceZ as IM or maybe map 'Cross-province' to an external name but using internal city data?
            // The request says "Systems cities only simulate IM".
            // So I will set ProvinceZ to "内蒙古自治区" or match CityZ's province.
            // But if Service Level is "Cross-province", logically ProvinceZ should be different.
            // I will keep ProvinceZ as "内蒙古自治区" to strictly follow "Only IM cities", implying this is a provincial view or simulation.
        }

        data.push({
            id: `sub-${i}`,
            productInstance,
            serviceType,
            serviceLevel,
            circuitCode,
            bandwidth,
            assuranceLevel: assuranceLevels[Math.floor(Math.random() * assuranceLevels.length)],
            customerCode,
            customerName,
            serviceStatus: statuses[Math.floor(Math.random() * statuses.length)],
            provinceA,
            cityA,
            districtA,
            addressA,
            accessTypeA,
            provinceZ,
            cityZ,
            districtZ,
            addressZ,
            accessTypeZ,
        });
    }
    return data;
}

// Generate Mock Data for Complaint
export const generateComplaintMockData = (count: number): ComplaintRecord[] => {
    const data: ComplaintRecord[] = [];
    const stages: ('T0' | 'T1' | 'T2' | 'Closed')[] = ['T0', 'T1', 'T2', 'Closed'];
    const businessCategories = ['专线', '5G专网', '物联网', '企宽'];
    const privateLineTypes = ['数据专线', '互联网专线', '语音专线', 'MPLS-VPN专线'];
    const faultResults = ['已修复', '误报', '观察中'];
    const faultTypes = ['光缆故障', '设备故障', '配置错误', '电力故障', '其他'];
    const assigneeRoles = ['铁通班组', '分公司客响', '综调中心'];
    const satisfaction = ['满意', '基本满意', '不满意'];
    const ticketSources = ['客户来电', '故障识别'];

    // Realistic Inner Mongolia Customers
    const realCustomers = [
        "内蒙古伊利实业集团", "内蒙古蒙牛乳业", "内蒙古电力集团", "包头钢铁集团",
        "内蒙古一机集团", "鄂尔多斯控股集团", "内蒙古自治区人民医院",
        "呼和浩特市教育局", "内蒙古大学", "内蒙古银行", "北方稀土",
        "内蒙古交通投资集团", "呼和浩特铁路局", "内蒙古新华发行集团"
    ];

    // Realistic Complaint Content
    const realComplaints = [
        "专线网络连接中断，无法访问外网",
        "访问内部ERP系统延迟极高，经常超时",
        "视频会议卡顿严重，伴有马赛克",
        "特定时间段网络丢包率超过10%",
        "光猫LOS红灯闪烁，业务全阻",
        "主用链路中断，未能自动切换至备用链路",
        "VPN拨号连接失败，提示错误619",
        "固定IP地址无法ping通",
        "上传速度只有签约带宽的10%",
        "机房设备断电告警，请核实供电情况"
    ];

    for (let i = 0; i < count; i++) {
        const { productInstance, circuitCode, cityA, cityZ, timeStr } = generateCommonFields(i, 'Complaint');
        const stage = stages[Math.floor(Math.random() * stages.length)];
        const businessCategory = businessCategories[Math.floor(Math.random() * businessCategories.length)];
        let productType = '';
        if (businessCategory === '专线') {
            productType = privateLineTypes[Math.floor(Math.random() * privateLineTypes.length)];
        }
        
        const addrA = getRandomAddress(cityA);
        const addrZ = getRandomAddress(cityZ);
        const ticketSource = ticketSources[Math.floor(Math.random() * ticketSources.length)];
        
        // SLA Status logic
        const slaStatusProb = Math.random();
        let slaStatus: 'Normal' | 'Warning' | 'Overdue' = 'Normal';
        if (slaStatusProb > 0.8) slaStatus = 'Warning';
        if (slaStatusProb > 0.95) slaStatus = 'Overdue';

        // Calculate SLA Deadline as a Timestamp
        const complaintDate = new Date(timeStr.replace(' ', 'T'));
        const deadlineHours = Math.floor(Math.random() * 48) + 4; // 4 to 52 hours deadline
        complaintDate.setHours(complaintDate.getHours() + deadlineHours);
        const slaDeadline = complaintDate.toISOString().replace('T', ' ').substring(0, 19);

        const record: ComplaintRecord = {
            id: `comp-${i}`,
            ticketNo: `TS-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
            stage,
            productInstance,
            circuitCode,
            customerName: realCustomers[Math.floor(Math.random() * realCustomers.length)],
            customerCode: `C-${Math.floor(Math.random() * 1000)}`,
            serviceAddressA: `${cityA}${addrA.district}${addrA.address}`,
            serviceAddressZ: `${cityZ}${addrZ.district}${addrZ.address}`,
            complaintContent: realComplaints[Math.floor(Math.random() * realComplaints.length)],
            faultTime: timeStr,
            complaintTime: timeStr,
            contactPerson: `Contact-${i}`,
            contactPhone: `1380000${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            assignee: `${assigneeRoles[Math.floor(Math.random() * assigneeRoles.length)]}-${cityA}`,
            assigneeCity: cityA,
            slaDeadline: slaDeadline, // Calculated timestamp
            slaStatus,
            productType,
            businessCategory,
            ticketSource,
        };

        // Always generate faultType to simulate initial report info
        record.faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];

        if (stage !== 'T0') {
            record.faultResult = faultResults[Math.floor(Math.random() * faultResults.length)];
            // record.faultType is set above
            record.faultCause = 'Auto generated cause description...';
        }

        if (stage === 'Closed') {
            record.isSatisfied = satisfaction[Math.floor(Math.random() * satisfaction.length)];
            record.qcRemarks = 'Verified and closed.';
        }

        data.push(record);
    }
    return data;
}

export const MOCK_DATA = generateMockData(45);
export const MOCK_SPN_DATA = generateSpnMockData(35);
export const MOCK_INTERNET_DATA = generateInternetMockData(40);
export const MOCK_ALARM_DATA = generateAlarmMockData(60);
export const MOCK_IPL_DATA = generateIplMockData(30);
export const MOCK_MPLS_DATA = generateMplsMockData(40);
export const MOCK_IGPL_DATA = generateIgplMockData(35);
export const MOCK_ROUTE_CITY_DATA = generateRouteCityMockData(50);
export const MOCK_ROUTE_DATA = generateRouteMockData(50);
export const MOCK_SUBSCRIPTION_DATA = generateSubscriptionMockData(50);
export const MOCK_COMPLAINT_DATA = generateComplaintMockData(40);
