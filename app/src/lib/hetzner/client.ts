const HETZNER_API = "https://api.hetzner.cloud/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.HETZNER_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export interface HetznerServer {
  id: number;
  public_net: {
    ipv4: { ip: string };
  };
  status: string;
}

export async function createServer(
  name: string,
  userData: string
): Promise<HetznerServer> {
  const res = await fetch(`${HETZNER_API}/servers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name,
      server_type: "cax21", // 4 vCPU, 8GB RAM (ARM)
      image: "ubuntu-24.04",
      location: "hel1", // Helsinki (required for ARM/cax servers)
      user_data: userData,
      start_after_create: true,
      labels: { app: "kidsclaw" },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      `Hetzner API error: ${res.status} - ${JSON.stringify(error)}`
    );
  }

  const data = await res.json();
  return data.server;
}

export async function deleteServer(serverId: string): Promise<void> {
  const res = await fetch(`${HETZNER_API}/servers/${serverId}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete server ${serverId}: ${res.status}`);
  }
}

export async function getServer(
  serverId: string
): Promise<HetznerServer | null> {
  const res = await fetch(`${HETZNER_API}/servers/${serverId}`, {
    headers: headers(),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to get server: ${res.status}`);

  const data = await res.json();
  return data.server;
}
