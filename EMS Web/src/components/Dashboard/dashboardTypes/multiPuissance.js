import { getDashboardTypeData } from '../../../services/emonAPI';

export const multiPuissanceConfig = {
  id: 'multipuissance',
  title: 'Multi-Phase Power Consumption',
  description: 'Combined view of three-phase power consumption',
  fetchData: async () => {
    return await getDashboardTypeData('multipuissance');
  },
  chartProps: {
    isMultiPower: true,
    defaultTimeRange: '1w'
  }
};


export const dashboardConfigs = {
  multipuissance: multiPuissanceConfig
};