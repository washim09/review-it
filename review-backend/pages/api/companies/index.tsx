// import { NextApiRequest, NextApiResponse } from 'next';
// import prisma from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//     try {
//       const companies = await prisma.company.findMany({
//         include: { products: true, reviews: true },
//       });
//       return res.status(200).json(companies);
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to fetch companies' });
//     }
//   }

//   if (req.method === 'POST') {
//     const { name, industry, description, logoUrl, contact, website } = req.body;
//     try {
//       const newCompany = await prisma.company.create({
//         data: { name, industry, description, logoUrl, contact, website },
//       });
//       return res.status(201).json(newCompany);
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to create company' });
//     }
//   }

//   res.setHeader('Allow', ['GET', 'POST']);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }
