export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    app: {
      title: 'Neko Punch',
      subtitle: '포트 충돌 & 프로세스 킬러',
      scanning: '포트 스캔 중...',
      refreshBtn: '새로고침',
      soundOn: '효과음 켜기',
      soundOff: '효과음 끄기',
      minimize: '최소화',
      hideToTray: '트레이로 숨기기',
      quit: '완전 종료',
    },
    filters: {
      all: '전체 포트',
      web: '웹/개발',
      db: 'DB',
      custom: '내 포트 ⭐',
      searchPlaceholder: '포트 번호 또는 프로세스 검색 (예: 8080, node)',
      customAddPlaceholder: '포트 번호 입력 (예: 8888)',
      addBtn: '추가',
      noCustomPorts: '등록된 내 포트가 없습니다. 위 입력창이나 포트 옆의 ⭐를 눌러 추가해 보세요!',
      customHint: '등록한 포트 목록은 자동으로 안전하게 저장됩니다.',
    },
    table: {
      port: '포트',
      process: '프로세스명',
      pid: 'PID',
      memory: '메모리',
      action: '냥펀치',
      emptyTitle: '점유 중인 포트가 없습니다!',
      emptyDesc: '현재 충돌하는 포트가 없이 평화롭습니다. zZZ',
      noFilterMatch: '검색 조건과 일치하는 포트가 없습니다.',
      punching: '타격 중...!',
      killed: '종료 완료! 💥',
    },
    status: {
      idle: '감시 중... 포트 충돌 시 냥펀치를 날려주세요!',
      portsFound: (count: number) => `점유 중인 ${count}개 포트 발견! 🐾`,
      killedSuccess: (port: number, name: string) => `:${port} (${name}) 프로세스를 종료했습니다!`,
      killFailed: (msg: string) => `종료 실패: ${msg}`,
    },
    footer: {
      trayHint: '상단 X 버튼을 누르면 프로그램이 즉시 완전 종료됩니다.',
    }
  },
  en: {
    app: {
      title: 'Neko Punch',
      subtitle: 'Port & Process Killer',
      scanning: 'Scanning ports...',
      refreshBtn: 'Refresh',
      soundOn: 'Sound on',
      soundOff: 'Mute',
      minimize: 'Minimize',
      hideToTray: 'Hide to tray',
      quit: 'Quit app',
    },
    filters: {
      all: 'All Ports',
      web: 'Web/Dev',
      db: 'Databases',
      custom: 'My Ports ⭐',
      searchPlaceholder: 'Search port or process (e.g. 8080, node)',
      customAddPlaceholder: 'Port number (e.g. 8888)',
      addBtn: 'Add',
      noCustomPorts: 'No custom ports added yet. Add one above or click ⭐ on any port below!',
      customHint: 'Your customized ports are saved automatically.',
    },
    table: {
      port: 'Port',
      process: 'Process Name',
      pid: 'PID',
      memory: 'Memory',
      action: 'Punch',
      emptyTitle: 'No listening ports found!',
      emptyDesc: 'Everything is quiet and peaceful right now. zZZ',
      noFilterMatch: 'No ports matching the current search.',
      punching: 'Striking...!',
      killed: 'KILLED! 💥',
    },
    status: {
      idle: 'Monitoring ports... Ready to punch!',
      portsFound: (count: number) => `${count} listening port(s) detected! 🐾`,
      killedSuccess: (port: number, name: string) => `Port :${port} (${name}) terminated!`,
      killFailed: (msg: string) => `Termination failed: ${msg}`,
    },
    footer: {
      trayHint: 'Clicking X immediately exits the application.',
    }
  }
};
