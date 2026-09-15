import { adminClient, fail, json, options } from "../_shared/core.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    const { email, password, role = "citizen", name, domain_id } = await req.json();

    if (!email || !password) {
      return fail("Email and password are required", 400);
    }
    if (password.length < 6) {
      return fail("Password must be at least 6 characters long", 400);
    }
    if (!["citizen", "authority"].includes(role)) {
      return fail("Role must be citizen or authority", 400);
    }

    const admin = adminClient();

    // Check if user already exists in auth
    const { data: userList } = await admin.auth.admin.listUsers();
    const existing = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    let user = existing;

    if (!user) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        app_metadata: { role },
        user_metadata: { name: name || email.split("@")[0] }
      });

      if (createError || !created.user) {
        return fail(createError?.message ?? "Could not create user account", 400);
      }
      user = created.user;
    } else {
      // Ensure existing user has the correct role
      await admin.auth.admin.updateUserById(user.id, {
        password,
        app_metadata: { ...user.app_metadata, role }
      });
    }

    // Role-specific records
    if (role === "citizen") {
      await admin.from("citizen_wallets").upsert(
        { wallet_id: user.id, reputation_score: 50.0 },
        { onConflict: "wallet_id" }
      );
    } else if (role === "authority") {
      let resolvedDomainId = domain_id;
      if (!resolvedDomainId) {
        // Fallback to Road domain
        const { data: dom } = await admin.from("domains").select("id").limit(1).single();
        resolvedDomainId = dom?.id;
      }

      await admin.from("authorities").upsert(
        {
          id: user.id,
          name: name || "Municipal Department",
          type: "in_house_officer",
          domain_id: resolvedDomainId,
          performance_score: 85.0
        },
        { onConflict: "id" }
      );

      if (resolvedDomainId) {
        await admin.from("domain_authority_map").upsert(
          {
            domain_id: resolvedDomainId,
            authority_id: user.id,
            effective_from: new Date().toISOString()
          },
          { onConflict: "domain_id,authority_id,effective_from" }
        );
      }
    }

    return json({ user, ok: true }, 201);
  } catch (err: any) {
    return fail(err.message || "Registration failed", 500);
  }
});
