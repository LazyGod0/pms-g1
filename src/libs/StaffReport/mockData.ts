// =============================
// File: /lib/mockData.ts
// Mocked publications similar to your Figma
// =============================
import { Publication } from '@/types/publication';

export const MOCK_PUBLICATIONS: Publication[] = [
  { id: 'p1', title: 'Deep Learning for Coral Reef Monitoring', authors: ['Somchai S.', 'Suda R.'], faculty: 'Faculty of Science', department: 'Computer Science', type: 'Journal', level: 'International', status: 'Approved', date: '2023-02-10', year: 2023 },
  { id: 'p2', title: 'Edge AI for Smart Campus', authors: ['Anan K.', 'Jane D.'], faculty: 'Faculty of Engineering', department: 'Electrical Engineering', type: 'Conference', level: 'National', status: 'Approved', date: '2024-01-15', year: 2024 },
  { id: 'p3', title: 'Thai NLP for Legal Texts', authors: ['Kittisak P.'], faculty: 'Faculty of Science', department: 'Computer Science', type: 'Journal', level: 'National', status: 'Pending Review', date: '2022-07-20', year: 2022 },
  { id: 'p4', title: 'Sustainable Energy Solutions for Rural Communities', authors: ['Manat T.'], faculty: 'Faculty of Engineering', department: 'Mechanical Engineering', type: 'Journal', level: 'International', status: 'Approved', date: '2023-05-15', year: 2023 },
  { id: 'p5', title: 'Digital Marketing Strategies for SMEs in Thailand', authors: ['Nicha L.'], faculty: 'Faculty of Management', department: 'Business Administration', type: 'Conference', level: 'National', status: 'Approved', date: '2024-03-10', year: 2024 },
  { id: 'p6', title: 'Cultural Heritage Preservation Through Digitization', authors: ['Pimchanok S.'], faculty: 'Faculty of Liberal Arts', department: 'History', type: 'Journal', level: 'International', status: 'Pending Review', date: '2022-11-20', year: 2022 },
  { id: 'p7', title: 'Machine Learning for Thai Agricultural Prediction', authors: ['Arthit P.'], faculty: 'Faculty of Science', department: 'Computer Science', type: 'Conference', level: 'International', status: 'Rejected', date: '2021-09-15', year: 2021 },
  { id: 'p8', title: 'Blockchain Technology in Supply Chain Management', authors: ['Somsri W.'], faculty: 'Faculty of Engineering', department: 'Civil Engineering', type: 'Journal', level: 'National', status: 'Needs Fix', date: '2024-06-10', year: 2024 },
  { id: 'p9', title: 'Economic Impact of Tourism on Local Communities', authors: ['Apinya K.'], faculty: 'Faculty of Management', department: 'Economics', type: 'Conference', level: 'International', status: 'Approved', date: '2023-08-05', year: 2023 },
  { id: 'p10', title: 'Innovations in Thai Language Education Technology', authors: ['Chanita M.'], faculty: 'Faculty of Liberal Arts', department: 'Thai Language', type: 'Journal', level: 'National', status: 'Draft', date: '2024-09-12', year: 2024 },
];
