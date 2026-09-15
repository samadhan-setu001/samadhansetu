const SUPABASE_URL = process.env.SUPABASE_URL || "https://yjwrhggsihmyleugbfco.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=representation"
};

async function main() {
  console.log("Fetching domains from Supabase...");
  const domRes = await fetch(`${SUPABASE_URL}/rest/v1/domains?select=*`, { headers });
  if (!domRes.ok) throw new Error(await domRes.text());
  const domains = await domRes.json();
  console.log("Domains found:", domains.map(d => `${d.name} (${d.id})`));

  const domainMap = Object.fromEntries(domains.map(d => [d.name.toLowerCase(), d.id]));

  const authorityConfigs = [
    {
      email: "pwd@city.gov",
      password: "VeriCity@2026!",
      name: "Public Works Department",
      domain: "road",
      type: "in_house_officer"
    },
    {
      email: "electric@city.gov",
      password: "VeriCity@2026!",
      name: "Electricity Board",
      domain: "streetlight",
      type: "in_house_officer"
    },
    {
      email: "water@city.gov",
      password: "VeriCity@2026!",
      name: "Water Supply & Sewerage Board",
      domain: "water",
      type: "in_house_officer"
    },
    {
      email: "swachhcorp@city.gov",
      password: "VeriCity@2026!",
      name: "City Sanitation Corporation",
      domain: "waste",
      type: "external_agency"
    }
  ];

  // List existing users
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  const listData = await listRes.json();
  const existingUsers = listData.users || [];

  for (const config of authorityConfigs) {
    const domainId = domainMap[config.domain];
    if (!domainId) continue;

    console.log(`\nProcessing ${config.email}...`);
    let user = existingUsers.find(u => u.email?.toLowerCase() === config.email.toLowerCase());

    if (!user) {
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: config.email,
          password: config.password,
          email_confirm: true,
          app_metadata: { role: "authority" },
          user_metadata: { name: config.name }
        })
      });
      if (!createRes.ok) {
        console.error(`Failed to create ${config.email}:`, await createRes.text());
        continue;
      }
      user = await createRes.json();
      console.log(`Created Auth user: ${user.id}`);
    } else {
      console.log(`User exists: ${user.id}, updating role...`);
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          app_metadata: { role: "authority" }
        })
      });
    }

    // Upsert authority record
    const authRes = await fetch(`${SUPABASE_URL}/rest/v1/authorities`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: user.id,
        name: config.name,
        type: config.type,
        domain_id: domainId,
        performance_score: 88.5
      })
    });
    if (!authRes.ok) console.error("Error upserting authority:", await authRes.text());
    else console.log(`Upserted authority: ${config.name}`);

    // Map domain
    const mapRes = await fetch(`${SUPABASE_URL}/rest/v1/domain_authority_map`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        domain_id: domainId,
        authority_id: user.id,
        effective_from: new Date().toISOString()
      })
    });
    if (!mapRes.ok) console.error("Error in domain_authority_map:", await mapRes.text());
    else console.log(`Mapped domain to ${config.name}`);
  }

  console.log("\nSeeding finished successfully!");
}

main().catch(console.error);
