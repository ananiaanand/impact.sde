export interface Project {
  number: string;
  category: string;
  name: string;
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
}

export const projects: Project[] = [
  {
    number: '01',
    category: 'Environment',
    name: 'Sustainable Architecture',
    col1Image1: '/slide1.png',
    col1Image2: '/slide2.png',
    col2Image: '/slide3.jpg',
  },
  {
    number: '02',
    category: 'Energy',
    name: 'Green City Living',
    col1Image1: '/slide2.png',
    col1Image2: '/slide3.jpg',
    col2Image: '/slide1.png',
  },
  {
    number: '03',
    category: 'Education',
    name: 'Eco-Friendly Spaces',
    col1Image1: '/slide3.jpg',
    col1Image2: '/slide1.png',
    col2Image: '/slide2.png',
  }
];
