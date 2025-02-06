// import { NextApiRequest, NextApiResponse } from 'next';
// import prisma from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { id } = req.query;

//   if (req.method === 'GET') {
//     try {
//       const company = await prisma.company.findUnique({
//         where: { id: Number(id) },
//         include: { products: true, reviews: true },
//       });
//       if (!company) return res.status(404).json({ error: 'Company not found' });
//       return res.status(200).json(company);
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to fetch company details' });
//     }
//   }

//   if (req.method === 'PUT') {
//     const { name, industry, description, logoUrl, contact, website } = req.body;
//     try {
//       const updatedCompany = await prisma.company.update({
//         where: { id: Number(id) },
//         data: { name, industry, description, logoUrl, contact, website },
//       });
//       return res.status(200).json(updatedCompany);
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to update company' });
//     }
//   }

//   if (req.method === 'DELETE') {
//     try {
//       await prisma.company.delete({ where: { id: Number(id) } });
//       return res.status(204).end();
//     } catch (error) {
//       return res.status(500).json({ error: 'Failed to delete company' });
//     }
//   }

//   res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }
