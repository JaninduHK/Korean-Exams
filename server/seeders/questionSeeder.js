const readingQuestions = [
  {
    type: 'reading',
    questionNumber: 1,
    difficulty: 'easy',
    questionText: '다음 그림의 이름은 무엇입니까?',
    questionTextKorean: '다음 그림의 이름은 무엇입니까?',
    options: [
      { label: 'A', text: '가방' },
      { label: 'B', text: '우산' },
      { label: 'C', text: '모자' },
      { label: 'D', text: '구두' }
    ],
    correctAnswer: 'C',
    explanation: '그림에서 보이는 것은 모자입니다. 모자 means "hat" in Korean.',
    topic: 'vocabulary'
  },
  {
    type: 'reading',
    questionNumber: 2,
    difficulty: 'easy',
    questionText: '빈칸에 알맞은 것을 고르십시오.\n\n저는 회사에서 ( )합니다.',
    options: [
      { label: 'A', text: '일' },
      { label: 'B', text: '책' },
      { label: 'C', text: '밥' },
      { label: 'D', text: '물' }
    ],
    correctAnswer: 'A',
    explanation: '회사에서 일합니다 means "I work at the company." 일 (work) is the correct answer.',
    topic: 'workplace-communication'
  },
  {
    type: 'reading',
    questionNumber: 3,
    difficulty: 'easy',
    questionText: '다음은 무엇에 대한 글입니까?\n\n"출입금지 - 안전모를 착용하세요"',
    options: [
      { label: 'A', text: '회사 규칙' },
      { label: 'B', text: '안전 수칙' },
      { label: 'C', text: '교통 규칙' },
      { label: 'D', text: '식당 안내' }
    ],
    correctAnswer: 'B',
    explanation: 'The sign says "No Entry - Wear a safety helmet" which is a safety rule (안전 수칙).',
    topic: 'workplace-safety'
  },
  {
    type: 'reading',
    questionNumber: 4,
    difficulty: 'medium',
    questionText: '다음 문장을 읽고 맞는 것을 고르십시오.\n\n"오늘은 월요일입니다. 내일은 화요일입니다."',
    options: [
      { label: 'A', text: '오늘은 일요일입니다' },
      { label: 'B', text: '내일은 수요일입니다' },
      { label: 'C', text: '어제는 일요일이었습니다' },
      { label: 'D', text: '어제는 토요일이었습니다' }
    ],
    correctAnswer: 'C',
    explanation: 'If today is Monday (월요일), then yesterday was Sunday (일요일).',
    topic: 'daily-life'
  },
  {
    type: 'reading',
    questionNumber: 5,
    difficulty: 'medium',
    questionText: '다음 글의 내용과 같은 것을 고르십시오.\n\n"공장에서 일할 때 반드시 안전 장갑을 끼세요. 뜨거운 물건을 만지면 다칠 수 있습니다."',
    options: [
      { label: 'A', text: '안전 장갑은 필요 없습니다' },
      { label: 'B', text: '공장에서 안전 장갑을 꼭 끼어야 합니다' },
      { label: 'C', text: '뜨거운 물건을 만져도 괜찮습니다' },
      { label: 'D', text: '장갑 없이 일해도 됩니다' }
    ],
    correctAnswer: 'B',
    explanation: 'The passage says you must wear safety gloves (안전 장갑) when working at the factory.',
    topic: 'workplace-safety'
  },
  {
    type: 'reading',
    questionNumber: 6,
    difficulty: 'medium',
    questionText: '빈칸에 알맞은 것을 고르십시오.\n\n가: 점심 먹었어요?\n나: 아니요, 아직 ( ).',
    options: [
      { label: 'A', text: '안 먹었어요' },
      { label: 'B', text: '먹었어요' },
      { label: 'C', text: '먹을 거예요' },
      { label: 'D', text: '먹고 있어요' }
    ],
    correctAnswer: 'A',
    explanation: 'The person replied "No, not yet..." so the answer is "haven\'t eaten yet" (안 먹었어요).',
    topic: 'daily-life'
  },
  {
    type: 'reading',
    questionNumber: 7,
    difficulty: 'easy',
    questionText: '다음은 무엇입니까?\n\n"응급 상황 시 119에 전화하세요"',
    options: [
      { label: 'A', text: '택시 번호' },
      { label: 'B', text: '긴급 전화번호' },
      { label: 'C', text: '회사 전화번호' },
      { label: 'D', text: '친구 전화번호' }
    ],
    correctAnswer: 'B',
    explanation: '119 is the emergency number in Korea. This is an emergency contact notice.',
    topic: 'workplace-safety'
  },
  {
    type: 'reading',
    questionNumber: 8,
    difficulty: 'hard',
    questionText: '다음 글을 읽고 질문에 답하십시오.\n\n"김 사장님께서 오늘 오후 3시에 회의실에서 직원 회의를 합니다. 모든 직원은 참석해 주세요."',
    options: [
      { label: 'A', text: '회의는 아침에 있습니다' },
      { label: 'B', text: '회의는 오후 3시에 있습니다' },
      { label: 'C', text: '일부 직원만 참석합니다' },
      { label: 'D', text: '회의는 내일 있습니다' }
    ],
    correctAnswer: 'B',
    explanation: 'The notice says the meeting is at 3 PM (오후 3시) today.',
    topic: 'workplace-communication'
  },
  {
    type: 'reading',
    questionNumber: 9,
    difficulty: 'medium',
    questionText: '다음 대화를 읽고 알맞은 것을 고르십시오.\n\n가: 실례합니다. 화장실이 어디 있어요?\n나: 저기 왼쪽으로 가시면 있어요.',
    options: [
      { label: 'A', text: '화장실은 오른쪽에 있습니다' },
      { label: 'B', text: '화장실은 왼쪽에 있습니다' },
      { label: 'C', text: '화장실은 앞에 있습니다' },
      { label: 'D', text: '화장실은 뒤에 있습니다' }
    ],
    correctAnswer: 'B',
    explanation: 'The person says the bathroom is on the left side (왼쪽).',
    topic: 'directions'
  },
  {
    type: 'reading',
    questionNumber: 10,
    difficulty: 'easy',
    questionText: '( )에 알맞은 것을 고르십시오.\n\n오늘 날씨가 ( ). 우산을 가지고 가세요.',
    options: [
      { label: 'A', text: '좋아요' },
      { label: 'B', text: '맑아요' },
      { label: 'C', text: '비가 와요' },
      { label: 'D', text: '더워요' }
    ],
    correctAnswer: 'C',
    explanation: 'Since you need an umbrella, it must be raining (비가 와요).',
    topic: 'weather'
  },
  {
    type: 'reading',
    questionNumber: 11,
    difficulty: 'hard',
    questionText: '다음 안내문을 읽고 맞는 것을 고르십시오.\n\n"근무 시간: 오전 9시 ~ 오후 6시\n점심 시간: 오후 12시 ~ 오후 1시\n토요일, 일요일: 휴무"',
    options: [
      { label: 'A', text: '하루에 8시간 일합니다' },
      { label: 'B', text: '점심 시간은 2시간입니다' },
      { label: 'C', text: '토요일에도 일합니다' },
      { label: 'D', text: '오전 8시에 출근합니다' }
    ],
    correctAnswer: 'A',
    explanation: 'Working hours are 9 AM to 6 PM with 1 hour lunch break = 8 hours of work.',
    topic: 'workplace-communication'
  },
  {
    type: 'reading',
    questionNumber: 12,
    difficulty: 'medium',
    questionText: '다음 글의 내용과 다른 것을 고르십시오.\n\n"저는 공장에서 일합니다. 아침 8시에 출근하고 저녁 5시에 퇴근합니다. 점심은 식당에서 먹습니다."',
    options: [
      { label: 'A', text: '이 사람은 공장에서 일합니다' },
      { label: 'B', text: '아침 8시에 일을 시작합니다' },
      { label: 'C', text: '저녁 5시에 집에 갑니다' },
      { label: 'D', text: '점심은 집에서 먹습니다' }
    ],
    correctAnswer: 'D',
    explanation: 'The text says lunch is eaten at the cafeteria (식당), not at home.',
    topic: 'workplace-communication'
  },
  {
    type: 'reading',
    questionNumber: 13,
    difficulty: 'easy',
    questionText: '다음 숫자를 한국어로 읽으면?\n\n"15,000원"',
    options: [
      { label: 'A', text: '천오백 원' },
      { label: 'B', text: '만오천 원' },
      { label: 'C', text: '일만오천 원' },
      { label: 'D', text: '오천 원' }
    ],
    correctAnswer: 'B',
    explanation: '15,000 is read as 만오천 (10,000 + 5,000).',
    topic: 'numbers-dates'
  },
  {
    type: 'reading',
    questionNumber: 14,
    difficulty: 'medium',
    questionText: '다음 글을 읽고 질문에 답하십시오.\n\n"기계를 사용하기 전에 안전 교육을 받으세요. 교육을 받지 않으면 기계를 사용할 수 없습니다."',
    options: [
      { label: 'A', text: '교육 없이 기계를 사용할 수 있습니다' },
      { label: 'B', text: '안전 교육을 먼저 받아야 합니다' },
      { label: 'C', text: '기계 사용은 자유입니다' },
      { label: 'D', text: '교육은 선택입니다' }
    ],
    correctAnswer: 'B',
    explanation: 'Safety training must be received before using machinery.',
    topic: 'workplace-safety'
  },
  {
    type: 'reading',
    questionNumber: 15,
    difficulty: 'hard',
    questionText: '다음 글에서 밑줄 친 부분의 의미와 같은 것을 고르십시오.\n\n"이 약은 식후에 드세요." (밑줄: 식후에)',
    options: [
      { label: 'A', text: '밥을 먹기 전에' },
      { label: 'B', text: '밥을 먹은 후에' },
      { label: 'C', text: '밥을 먹으면서' },
      { label: 'D', text: '밥 대신에' }
    ],
    correctAnswer: 'B',
    explanation: '식후에 means "after eating" (식 = meal, 후 = after).',
    topic: 'health'
  },
  {
    type: 'reading',
    questionNumber: 16,
    difficulty: 'medium',
    questionText: '( )에 들어갈 알맞은 말을 고르십시오.\n\n가: 여보세요, 김 대리님 계세요?\n나: 지금 ( ). 메시지 남기시겠어요?',
    options: [
      { label: 'A', text: '자리에 계세요' },
      { label: 'B', text: '자리에 안 계세요' },
      { label: 'C', text: '통화 중이에요' },
      { label: 'D', text: '회의 중이에요' }
    ],
    correctAnswer: 'B',
    explanation: 'Since the response asks if they want to leave a message, the person is not at their seat.',
    topic: 'workplace-communication'
  },
  {
    type: 'reading',
    questionNumber: 17,
    difficulty: 'easy',
    questionText: '다음 표지판의 의미는?\n\n"금연"',
    options: [
      { label: 'A', text: '담배를 피우세요' },
      { label: 'B', text: '담배를 피우지 마세요' },
      { label: 'C', text: '담배를 팔아요' },
      { label: 'D', text: '담배를 사세요' }
    ],
    correctAnswer: 'B',
    explanation: '금연 means "No smoking" - smoking is prohibited.',
    topic: 'workplace-safety'
  },
  {
    type: 'reading',
    questionNumber: 18,
    difficulty: 'medium',
    questionText: '다음 대화의 빈칸에 알맞은 것을 고르십시오.\n\n가: 이거 얼마예요?\n나: ( )원이에요.',
    options: [
      { label: 'A', text: '삼천' },
      { label: 'B', text: '세 개' },
      { label: 'C', text: '셋째' },
      { label: 'D', text: '세 번' }
    ],
    correctAnswer: 'A',
    explanation: 'The question asks about price (얼마), so the answer should be a number (삼천원 = 3,000 won).',
    topic: 'shopping'
  },
  {
    type: 'reading',
    questionNumber: 19,
    difficulty: 'hard',
    questionText: '다음 글을 읽고 이 사람이 어디에서 일하는지 고르십시오.\n\n"저는 환자들을 돌봅니다. 의사 선생님을 도와드리고 주사도 놓습니다."',
    options: [
      { label: 'A', text: '학교' },
      { label: 'B', text: '공장' },
      { label: 'C', text: '병원' },
      { label: 'D', text: '식당' }
    ],
    correctAnswer: 'C',
    explanation: 'This person takes care of patients and helps doctors - they work at a hospital (병원).',
    topic: 'workplace-communication'
  },
  {
    type: 'reading',
    questionNumber: 20,
    difficulty: 'easy',
    questionText: '( )에 알맞은 것을 고르십시오.\n\n저는 한국어를 ( ) 공부합니다.',
    options: [
      { label: 'A', text: '열심히' },
      { label: 'B', text: '열심' },
      { label: 'C', text: '열심하게' },
      { label: 'D', text: '열심이' }
    ],
    correctAnswer: 'A',
    explanation: '열심히 is the correct adverb form meaning "diligently" or "hard."',
    topic: 'grammar'
  }
];

const listeningQuestions = [
  {
    type: 'listening',
    questionNumber: 21,
    difficulty: 'easy',
    questionText: '다음을 듣고 알맞은 그림을 고르십시오.',
    audioFile: '/audio/sample-listening-1.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '사과' },
      { label: 'B', text: '바나나' },
      { label: 'C', text: '포도' },
      { label: 'D', text: '수박' }
    ],
    correctAnswer: 'A',
    explanation: 'The audio describes an apple (사과).',
    topic: 'listening-comprehension'
  },
  {
    type: 'listening',
    questionNumber: 22,
    difficulty: 'easy',
    questionText: '다음을 듣고 질문에 맞는 대답을 고르십시오.\n\n"무슨 요일이에요?"',
    audioFile: '/audio/sample-listening-2.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '3시예요' },
      { label: 'B', text: '월요일이에요' },
      { label: 'C', text: '서울이에요' },
      { label: 'D', text: '좋아요' }
    ],
    correctAnswer: 'B',
    explanation: 'The question asks "What day is it?" so the answer should be a day of the week.',
    topic: 'listening-comprehension'
  },
  {
    type: 'listening',
    questionNumber: 23,
    difficulty: 'medium',
    questionText: '다음 대화를 듣고 남자가 어디에 가는지 고르십시오.',
    audioFile: '/audio/sample-listening-3.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '회사' },
      { label: 'B', text: '은행' },
      { label: 'C', text: '병원' },
      { label: 'D', text: '학교' }
    ],
    correctAnswer: 'B',
    explanation: 'In the conversation, the man mentions going to the bank (은행).',
    topic: 'listening-comprehension'
  },
  {
    type: 'listening',
    questionNumber: 24,
    difficulty: 'medium',
    questionText: '다음을 듣고 대화의 내용과 같은 것을 고르십시오.',
    audioFile: '/audio/sample-listening-4.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '여자는 아침을 먹었습니다' },
      { label: 'B', text: '여자는 아침을 안 먹었습니다' },
      { label: 'C', text: '남자는 배가 고프지 않습니다' },
      { label: 'D', text: '둘 다 점심을 먹었습니다' }
    ],
    correctAnswer: 'B',
    explanation: 'The woman says she hasn\'t eaten breakfast yet.',
    topic: 'listening-comprehension'
  },
  {
    type: 'listening',
    questionNumber: 25,
    difficulty: 'hard',
    questionText: '다음 안내 방송을 듣고 내용과 같은 것을 고르십시오.',
    audioFile: '/audio/sample-listening-5.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '회의는 10시에 시작합니다' },
      { label: 'B', text: '회의는 취소되었습니다' },
      { label: 'C', text: '회의 장소가 바뀌었습니다' },
      { label: 'D', text: '회의는 내일 있습니다' }
    ],
    correctAnswer: 'C',
    explanation: 'The announcement says the meeting location has changed.',
    topic: 'workplace-communication'
  },
  {
    type: 'listening',
    questionNumber: 26,
    difficulty: 'easy',
    questionText: '다음을 듣고 남자의 직업을 고르십시오.',
    audioFile: '/audio/sample-listening-6.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '의사' },
      { label: 'B', text: '선생님' },
      { label: 'C', text: '요리사' },
      { label: 'D', text: '경찰관' }
    ],
    correctAnswer: 'C',
    explanation: 'The man says he works in a restaurant cooking food - he is a chef (요리사).',
    topic: 'workplace-communication'
  },
  {
    type: 'listening',
    questionNumber: 27,
    difficulty: 'medium',
    questionText: '다음 대화를 듣고 여자가 무엇을 살 것인지 고르십시오.',
    audioFile: '/audio/sample-listening-7.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '빵' },
      { label: 'B', text: '우유' },
      { label: 'C', text: '과일' },
      { label: 'D', text: '고기' }
    ],
    correctAnswer: 'B',
    explanation: 'The woman says she needs to buy milk (우유).',
    topic: 'shopping'
  },
  {
    type: 'listening',
    questionNumber: 28,
    difficulty: 'hard',
    questionText: '다음 대화를 듣고 두 사람이 만날 시간을 고르십시오.',
    audioFile: '/audio/sample-listening-8.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '오후 2시' },
      { label: 'B', text: '오후 3시' },
      { label: 'C', text: '오후 4시' },
      { label: 'D', text: '오후 5시' }
    ],
    correctAnswer: 'B',
    explanation: 'They agreed to meet at 3 PM (오후 3시).',
    topic: 'daily-life'
  },
  {
    type: 'listening',
    questionNumber: 29,
    difficulty: 'medium',
    questionText: '다음을 듣고 남자가 왜 회사에 못 갔는지 고르십시오.',
    audioFile: '/audio/sample-listening-9.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '아파서' },
      { label: 'B', text: '늦잠을 자서' },
      { label: 'C', text: '비가 와서' },
      { label: 'D', text: '차가 고장나서' }
    ],
    correctAnswer: 'A',
    explanation: 'The man says he couldn\'t go to work because he was sick (아파서).',
    topic: 'health'
  },
  {
    type: 'listening',
    questionNumber: 30,
    difficulty: 'easy',
    questionText: '다음을 듣고 오늘의 날씨를 고르십시오.',
    audioFile: '/audio/sample-listening-10.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '맑음' },
      { label: 'B', text: '흐림' },
      { label: 'C', text: '비' },
      { label: 'D', text: '눈' }
    ],
    correctAnswer: 'C',
    explanation: 'The weather report says it will rain today (비).',
    topic: 'weather'
  },
  {
    type: 'listening',
    questionNumber: 31,
    difficulty: 'hard',
    questionText: '다음 안전 교육 내용을 듣고 맞는 것을 고르십시오.',
    audioFile: '/audio/sample-listening-11.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '화재 시 엘리베이터를 타세요' },
      { label: 'B', text: '화재 시 계단을 이용하세요' },
      { label: 'C', text: '화재 시 창문으로 나가세요' },
      { label: 'D', text: '화재 시 사무실에 있으세요' }
    ],
    correctAnswer: 'B',
    explanation: 'During a fire, use the stairs (계단), not the elevator.',
    topic: 'workplace-safety'
  },
  {
    type: 'listening',
    questionNumber: 32,
    difficulty: 'medium',
    questionText: '다음 대화를 듣고 여자의 취미가 무엇인지 고르십시오.',
    audioFile: '/audio/sample-listening-12.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '독서' },
      { label: 'B', text: '운동' },
      { label: 'C', text: '요리' },
      { label: 'D', text: '영화 보기' }
    ],
    correctAnswer: 'D',
    explanation: 'The woman says her hobby is watching movies (영화 보기).',
    topic: 'daily-life'
  },
  {
    type: 'listening',
    questionNumber: 33,
    difficulty: 'easy',
    questionText: '다음을 듣고 대화가 일어나는 장소를 고르십시오.',
    audioFile: '/audio/sample-listening-13.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '식당' },
      { label: 'B', text: '병원' },
      { label: 'C', text: '은행' },
      { label: 'D', text: '우체국' }
    ],
    correctAnswer: 'A',
    explanation: 'The conversation mentions ordering food - they are at a restaurant (식당).',
    topic: 'daily-life'
  },
  {
    type: 'listening',
    questionNumber: 34,
    difficulty: 'medium',
    questionText: '다음을 듣고 남자가 부탁하는 것을 고르십시오.',
    audioFile: '/audio/sample-listening-14.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '창문을 열어 주세요' },
      { label: 'B', text: '문을 닫아 주세요' },
      { label: 'C', text: '불을 켜 주세요' },
      { label: 'D', text: '에어컨을 꺼 주세요' }
    ],
    correctAnswer: 'A',
    explanation: 'The man asks to open the window (창문을 열어 주세요).',
    topic: 'daily-life'
  },
  {
    type: 'listening',
    questionNumber: 35,
    difficulty: 'hard',
    questionText: '다음 공장 안내 방송을 듣고 작업자들이 해야 할 일을 고르십시오.',
    audioFile: '/audio/sample-listening-15.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '작업을 계속하세요' },
      { label: 'B', text: '기계를 점검하세요' },
      { label: 'C', text: '점심을 먹으세요' },
      { label: 'D', text: '퇴근하세요' }
    ],
    correctAnswer: 'B',
    explanation: 'The announcement asks workers to check the machines (기계를 점검하세요).',
    topic: 'workplace-communication'
  },
  {
    type: 'listening',
    questionNumber: 36,
    difficulty: 'easy',
    questionText: '다음을 듣고 여자가 어떻게 출근하는지 고르십시오.',
    audioFile: '/audio/sample-listening-16.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '버스' },
      { label: 'B', text: '지하철' },
      { label: 'C', text: '자동차' },
      { label: 'D', text: '자전거' }
    ],
    correctAnswer: 'B',
    explanation: 'The woman says she commutes by subway (지하철).',
    topic: 'transportation'
  },
  {
    type: 'listening',
    questionNumber: 37,
    difficulty: 'medium',
    questionText: '다음 대화를 듣고 남자가 찾는 곳을 고르십시오.',
    audioFile: '/audio/sample-listening-17.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '화장실' },
      { label: 'B', text: '식당' },
      { label: 'C', text: '휴게실' },
      { label: 'D', text: '사무실' }
    ],
    correctAnswer: 'C',
    explanation: 'The man is looking for the break room (휴게실).',
    topic: 'directions'
  },
  {
    type: 'listening',
    questionNumber: 38,
    difficulty: 'hard',
    questionText: '다음을 듣고 이 사람이 일하는 시간을 고르십시오.',
    audioFile: '/audio/sample-listening-18.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '오전 7시부터 오후 4시까지' },
      { label: 'B', text: '오전 8시부터 오후 5시까지' },
      { label: 'C', text: '오전 9시부터 오후 6시까지' },
      { label: 'D', text: '오전 10시부터 오후 7시까지' }
    ],
    correctAnswer: 'C',
    explanation: 'The person works from 9 AM to 6 PM (오전 9시부터 오후 6시까지).',
    topic: 'workplace-communication'
  },
  {
    type: 'listening',
    questionNumber: 39,
    difficulty: 'medium',
    questionText: '다음 대화를 듣고 두 사람의 관계를 고르십시오.',
    audioFile: '/audio/sample-listening-19.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '선생님과 학생' },
      { label: 'B', text: '의사와 환자' },
      { label: 'C', text: '상사와 부하직원' },
      { label: 'D', text: '친구' }
    ],
    correctAnswer: 'C',
    explanation: 'The conversation suggests a boss-employee relationship (상사와 부하직원).',
    topic: 'workplace-communication'
  },
  {
    type: 'listening',
    questionNumber: 40,
    difficulty: 'easy',
    questionText: '다음을 듣고 몇 시에 점심을 먹는지 고르십시오.',
    audioFile: '/audio/sample-listening-20.mp3',
    maxReplays: 2,
    options: [
      { label: 'A', text: '11시' },
      { label: 'B', text: '12시' },
      { label: 'C', text: '1시' },
      { label: 'D', text: '2시' }
    ],
    correctAnswer: 'B',
    explanation: 'They eat lunch at 12 o\'clock (12시).',
    topic: 'daily-life'
  }
];

module.exports = { readingQuestions, listeningQuestions };
