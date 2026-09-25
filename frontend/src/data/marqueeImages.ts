export interface SDG {
  number: string;
  name: string;
  color: string;
}

export const sdgData: SDG[] = [
  { number: '01', name: 'No Poverty', color: '#e5243b' },
  { number: '02', name: 'Zero Hunger', color: '#dda63a' },
  { number: '03', name: 'Good Health and Well-being', color: '#4c9f38' },
  { number: '04', name: 'Quality Education', color: '#c5192d' },
  { number: '05', name: 'Gender Equality', color: '#ff3a21' },
  { number: '06', name: 'Clean Water and Sanitation', color: '#26bde2' },
  { number: '07', name: 'Affordable and Clean Energy', color: '#fcc30b' },
  { number: '08', name: 'Decent Work and Economic Growth', color: '#a21942' },
  { number: '09', name: 'Industry, Innovation and Infrastructure', color: '#fd6925' },
  { number: '10', name: 'Reduced Inequalities', color: '#dd1367' },
  { number: '11', name: 'Sustainable Cities and Communities', color: '#fd9d24' },
  { number: '12', name: 'Responsible Consumption and Production', color: '#bf8b2e' },
  { number: '13', name: 'Climate Action', color: '#3f7e44' },
  { number: '14', name: 'Life Below Water', color: '#0a97d9' },
  { number: '15', name: 'Life on Land', color: '#56c02b' },
  { number: '16', name: 'Peace, Justice and Strong Institutions', color: '#00689d' },
  { number: '17', name: 'Partnerships for the Goals', color: '#19486a' },
];

export const marqueeRow1 = sdgData.slice(0, 9);
export const marqueeRow2 = sdgData.slice(9);
