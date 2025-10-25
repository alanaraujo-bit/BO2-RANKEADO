export default function handler(req, res) {
  const secret = process.env.BO2_SECRET;
  return res.status(200).json({
    ok: true,
    env: {
      hasBO2_SECRET: !!secret,
      secretLength: secret ? String(secret).length : 0,
    },
    time: new Date().toISOString(),
  });
}
