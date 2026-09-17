"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { PRIVY_APP_ID, HAS_PRIVY } from "@/lib/privy";

interface Props {
  children: ReactNode;
}

export function PrivyProviderWrapper({ children }: Props) {
  const [PrivyComp, setPrivyComp] = useState<any>(null);

  useEffect(() => {
    // Only attempt to load @privy-io/react-auth if user has provided a real App ID
    if (HAS_PRIVY) {
      try {
        const pkg = "@privy-io/react-auth";
        import(/* webpackIgnore: true */ pkg)
          .then((mod) => {
            if (mod?.PrivyProvider) {
              setPrivyComp(() => mod.PrivyProvider);
            }
          })
          .catch((err) => {
            console.info("[Privy] @privy-io/react-auth not yet installed. Running in local deterministic wallet mode.", err);
          });
      } catch (e) {
        // Safe fallback
      }
    }
  }, []);

  if (PrivyComp && HAS_PRIVY) {
    const Component = PrivyComp;
    return (
      <Component
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ["sms"],
          appearance: {
            theme: "light",
            accentColor: "#2563EB",
          },
          embeddedWallets: {
            createOnLogin: "all-users",
          },
        }}
      >
        {children}
      </Component>
    );
  }

  // Graceful fallback renders app normally with local deterministic embedded wallets
  return <>{children}</>;
}
