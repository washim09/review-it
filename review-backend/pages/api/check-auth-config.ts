// // pages/api/check-auth-config.ts
// import { NextApiRequest, NextApiResponse } from 'next';

// export default (req: NextApiRequest, res: NextApiResponse) => {
//   res.status(200).json({
//     jwtSecret: !!process.env.JWT_SECRET,
//     env: process.env.NODE_ENV
//   });
// };