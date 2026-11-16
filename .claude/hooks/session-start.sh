#!/bin/bash
# 클라우드 세션이 시작·재개될 때: 의존 패키지를 맞추고, 시험용 도커·Supabase·개발 서버를 백그라운드로 켠다.
# (시험용 컴퓨터가 쉬는 동안 멈추면 이 프로그램들이 같이 꺼지기 때문에, 돌아올 때마다 자동으로 되살린다)
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}/research-village"

# 1) 패키지: package.json / package-lock.json 이 바뀐 경우에만 설치
hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  npm install --no-audit --no-fund
  sha256sum ../.claude/hooks/session-start.sh package.json package-lock.json 2>/dev/null > "$hashes" || rm -f "$hashes"
fi

# 2) 시험용 서버 켜기 (오래 걸려서 기다리지 않고 백그라운드로 돌린다)
LOG=/tmp/rv-session-start.log
nohup bash -c '
  if ! docker ps >/dev/null 2>&1; then
    pkill -9 dockerd 2>/dev/null; pkill -9 containerd 2>/dev/null; sleep 2; rm -f /var/run/docker.pid
    (nohup containerd >/tmp/containerd.log 2>&1 &); sleep 5
    (nohup dockerd >/tmp/dockerd.log 2>&1 &); sleep 15
  fi
  npx supabase start >/dev/null 2>&1; sleep 25; npx supabase start >/dev/null 2>&1
  if ! curl -s -o /dev/null http://localhost:3000/; then
    rm -rf .next
    nohup npm run dev >/tmp/rv-dev.log 2>&1 &
  fi
' >"$LOG" 2>&1 &

exit 0
