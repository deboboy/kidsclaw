/**
 * Generates the cloud-init user_data script for VPS provisioning.
 * Each step reports progress back to the webhook endpoint.
 */
export function buildCloudInitScript({
  webhookUrl,
  provisionSecret,
  instanceId,
  subdomain,
}: {
  webhookUrl: string;
  provisionSecret: string;
  instanceId: string;
  subdomain: string;
}): string {
  return `#!/bin/bash
set -euo pipefail

WEBHOOK_URL="${webhookUrl}"
PROVISION_SECRET="${provisionSecret}"
INSTANCE_ID="${instanceId}"
SUBDOMAIN="${subdomain}"

report_progress() {
  local step="$1"
  local message="$2"
  curl -sf -X POST "$WEBHOOK_URL" \\
    -H "Content-Type: application/json" \\
    -H "X-Provision-Secret: $PROVISION_SECRET" \\
    -H "X-Instance-Id: $INSTANCE_ID" \\
    -d "{\\"step\\": \\"$step\\", \\"message\\": \\"$message\\"}" || true
}

report_progress "system_setup" "Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git ufw caddy jq

report_progress "install_node" "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs

report_progress "install_openclaw" "Installing OpenClaw..."
npm install -g openclaw@latest

report_progress "configure_openclaw" "Configuring OpenClaw for KidsClaw..."
mkdir -p /opt/kidsclaw
cat > /opt/kidsclaw/SOUL.md << 'SOUL_EOF'
You are a friendly, educational AI game host for kids aged 9-11.
You specialize in science, math, and space exploration games.
Always be encouraging, patient, and age-appropriate.
Use emojis and fun language to keep kids engaged.
Never share inappropriate content or break character.
If a kid asks something off-topic, gently redirect them back to the game.
SOUL_EOF

openclaw onboard --non-interactive --soul /opt/kidsclaw/SOUL.md || true

# Create systemd service for OpenClaw
cat > /etc/systemd/system/openclaw.service << 'SERVICE_EOF'
[Unit]
Description=OpenClaw Instance
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/kidsclaw
ExecStart=/usr/bin/openclaw serve --port 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
systemctl enable openclaw
systemctl start openclaw

report_progress "deploy_games" "Setting up game library..."
cat > /opt/kidsclaw/games.json << 'GAMES_EOF'
{
  "games": [
    {"id": "mars-mission", "name": "Mars Mission", "day": 1, "icon": "🚀", "topic": "Math in Space"},
    {"id": "science-lab", "name": "Science Lab", "day": 2, "icon": "🔬", "topic": "Home Experiments"},
    {"id": "space-mission", "name": "Mission Design", "day": 3, "icon": "🛸", "topic": "Creative Planning"},
    {"id": "trivia", "name": "Space Trivia", "day": 4, "icon": "🌌", "topic": "Quick Trivia"},
    {"id": "astronomy", "name": "Star Gazer", "day": 5, "icon": "🔭", "topic": "Astronomy"},
    {"id": "scale-math", "name": "Space Scale", "day": 6, "icon": "📏", "topic": "Math & Measurement"},
    {"id": "what-if", "name": "What If...?", "day": 7, "icon": "✨", "topic": "Creative Writing"}
  ]
}
GAMES_EOF

report_progress "firewall_caddy" "Configuring firewall and web server..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

cat > /etc/caddy/Caddyfile << CADDY_EOF
$SUBDOMAIN.play.kidsclaw.club {
    reverse_proxy localhost:3000
    encode gzip
}
CADDY_EOF

systemctl restart caddy

report_progress "ready" "KidsClaw is ready to play!"
`;
}
