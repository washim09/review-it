import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { name, description, website, logo } = req.body;

            const company = await prisma.company.create({
                data: { name, description, website, logo },
            });

            return res.status(201).json(company);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create company' });
        }
    } else if (req.method === 'GET') {
        try {
            const companies = await prisma.company.findMany();
            return res.status(200).json(companies);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch companies' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
