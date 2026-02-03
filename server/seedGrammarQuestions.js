const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

// Grammar questions data
const grammarQuestions = [
  {
    questionNumber: 6,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '주말에 일하았어요.' },
      { label: '②', text: '어제 신문을 읽었어요.' },
      { label: '③', text: '작년에 한국에 오였어요.' },
      { label: '④', text: '수요일에 영화관에 가있어요.' }
    ],
    correctAnswer: '②',
    explanation: 'The correct past tense form of 읽다 (to read) is 읽었어요.'
  },
  {
    questionNumber: 7,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '휴게실에서 쉬습니다.' },
      { label: '②', text: '기숙사에서 청소하습니다.' },
      { label: '③', text: '시장에서 과일을 사습니다.' },
      { label: '④', text: '식당에서 점심을 먹습니다.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct form of 먹다 (to eat) in present tense is 먹습니다.'
  },
  {
    questionNumber: 8,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '주말에 장에 봤습니다.' },
      { label: '②', text: '어제 친구가 만났습니다.' },
      { label: '③', text: '일곱 시에 퇴근했습니다.' },
      { label: '④', text: '아침에 빵를 먹었습니다.' }
    ],
    correctAnswer: '③',
    explanation: 'The correct past tense form and particle usage is 퇴근했습니다.'
  },
  {
    questionNumber: 9,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '집까지 걸어서 20분쯤 들어요.' },
      { label: '②', text: '퇴근 시간에는 차가 많이 걸려요.' },
      { label: '③', text: '생일에 친구들을 집으로 건너갔어요.' },
      { label: '④', text: '아침에 비가 왔는데 지금은 그쳤어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct form of 그치다 (to stop) in past tense is 그쳤어요.'
  },
  {
    questionNumber: 10,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '어머니께서 청소를 하십니다.' },
      { label: '②', text: '아버지께서 창문을 닦십니다.' },
      { label: '③', text: '할머니께서 음식을 만들십니다.' },
      { label: '④', text: '할아버지께서는 키가 크으십니다.' }
    ],
    correctAnswer: '①',
    explanation: 'The correct honorific form of 하다 (to do) is 하십니다.'
  },
  {
    questionNumber: 11,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '주스과 우유를 마셔요.' },
      { label: '②', text: '김밥와 라면을 주세요.' },
      { label: '③', text: '편의점과 식당이 있어요.' },
      { label: '④', text: '우동와 돈가스를 먹어요.' }
    ],
    correctAnswer: '③',
    explanation: 'The correct conjunction particle is 과 (used after words ending in consonants).'
  },
  {
    questionNumber: 12,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '상자가 아주 무겁었어요.' },
      { label: '②', text: '동생의 가방이 예쁘어요.' },
      { label: '③', text: '오늘 날씨가 정말 덥어요.' },
      { label: '④', text: '한국 음식을 잘 만드네요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct form of 만들다 (to make) with 네요 ending is 만드네요.'
  },
  {
    questionNumber: 13,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '어머니는 옷을 읽었어요.' },
      { label: '②', text: '어제 청소기를 넣었어요.' },
      { label: '③', text: '친구는 창문을 쓸었어요.' },
      { label: '④', text: '오전에 세탁기를 돌렸어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct past tense form of 돌리다 (to run/turn) is 돌렸어요.'
  },
  {
    questionNumber: 14,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '집이 가깝어서 걸어왔어요.' },
      { label: '②', text: '친구를 만나아서 즐거웠어요.' },
      { label: '③', text: '오늘 피곤하서 일찍 잤어요.' },
      { label: '④', text: '눈이 많이 와서 차가 막혔어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct connector for cause and effect is 와서 after 오다 (to come).'
  },
  {
    questionNumber: 15,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '오늘은 날씨가 정말 추우네요.' },
      { label: '②', text: '어머니께서 음식을 만들십니다.' },
      { label: '③', text: '기숙사에서 음악을 들을 거예요.' },
      { label: '④', text: '제가 이따가 휴게실을 청소핼게요' }
    ],
    correctAnswer: '①',
    explanation: 'The correct adjective form with 네요 ending is 추우네요.'
  },
  {
    questionNumber: 16,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '여기에 이름이 쓰세요.' },
      { label: '②', text: '이 층으로 올라가세요.' },
      { label: '③', text: '여기에서 손에 씻으세요.' },
      { label: '④', text: '사무실 안에서 들어오세요.' }
    ],
    correctAnswer: '②',
    explanation: 'The correct imperative form with the correct particle is 올라가세요.'
  },
  {
    questionNumber: 17,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '맛있은 빵을 먹었어요.' },
      { label: '②', text: '예쁜 원피스를 살 거예요.' },
      { label: '③', text: '덥은 날씨를 안 좋아해요.' },
      { label: '④', text: '머리가 짧는 사람이 제 친구예요.' }
    ],
    correctAnswer: '②',
    explanation: 'The correct adjective form modifying a noun is 예쁜.'
  },
  {
    questionNumber: 18,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '바다가 무척 아름답을 거예요.' },
      { label: '②', text: '쓰레기는 봉투에 넣아야 해요.' },
      { label: '③', text: '저녁에 불고기를 만들려고 해요.' },
      { label: '④', text: '청소하기 전에 창문을 열으야 돼요.' }
    ],
    correctAnswer: '③',
    explanation: 'The correct intention expression is 만들려고 해요.'
  },
  {
    questionNumber: 19,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '동생이 피아노를 췄어요.' },
      { label: '②', text: '주말에 배드민턴을 탔어요.' },
      { label: '③', text: '친구와 테니스를 들었어요.' },
      { label: '④', text: '바다가 예뻐서 사진을 찍었어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct past tense form of 찍다 (to take a photo) is 찍었어요.'
  },
  {
    questionNumber: 20,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '불고기를 만들아서 먹었어요.' },
      { label: '②', text: '편지를 쓰서 친구에게 줬어요.' },
      { label: '③', text: '아침에 일어났어서 운동했어요.' },
      { label: '④', text: '고향에 가서 부모님을 만났어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct connector is 가서 after 가다 (to go).'
  },
  {
    questionNumber: 21,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '이메일을 쓰을래요?' },
      { label: '②', text: '어디에서 만들을래요?' },
      { label: '③', text: '아침에 뭘 먹을래요?' },
      { label: '④', text: '같이 음악을 들을래요?' }
    ],
    correctAnswer: '③',
    explanation: 'The correct form with -(으)ㄹ래요 is 먹을래요.'
  },
  {
    questionNumber: 22,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '기숙사에 살으면 편해요.' },
      { label: '②', text: '많이 아프면 병원에 가세요.' },
      { label: '③', text: '방이 덥으면 창문을 여세요.' },
      { label: '④', text: '시간이 있면 영화를 볼 거예요.' }
    ],
    correctAnswer: '②',
    explanation: 'The correct conditional form with imperative is 아프면 가세요.'
  },
  {
    questionNumber: 23,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '기숙사에 살니까 편해요.' },
      { label: '②', text: '상자가 무겁우니까 조심하세요.' },
      { label: '③', text: '음악을 듣으니까 기분이 좋아요.' },
      { label: '④', text: '제주도가 유명하니까 가 보세요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct form with -(으)니까 is 유명하니까.'
  },
  {
    questionNumber: 24,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '배가 아프는데 약이 있어요?' },
      { label: '②', text: '주소를 모르는데 어떻게 해요?' },
      { label: '③', text: '기숙사에 가은데 같이 갈까요?' },
      { label: '④', text: '오늘은 덥은데 내일 만날까요?' }
    ],
    correctAnswer: '②',
    explanation: 'The correct form with -는데 after verb is 모르는데.'
  },
  {
    questionNumber: 25,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '이 의자에 좀 앉어도 돼요?' },
      { label: '②', text: '사무실 앞에 주차하도 돼요?' },
      { label: '③', text: '여기에서 담배를 피우도 돼요?' },
      { label: '④', text: '극장에서 사진을 찍어도 돼요?' }
    ],
    correctAnswer: '④',
    explanation: 'The correct permission form is 찍어도 돼요.'
  },
  {
    questionNumber: 26,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '저는 따뜻하는 봄이 좋아요.' },
      { label: '②', text: '자주 만들는 음식이 뭐예요?' },
      { label: '③', text: '제일 가깝은 약국이 어디예요?' },
      { label: '④', text: '지금 듣는 음악은 K-팝이에요.' }
    ],
    correctAnswer: '③',
    explanation: 'The correct adjective form modifying a noun is 가깝은.'
  },
  {
    questionNumber: 27,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '한복을 입을 줄 알아요.' },
      { label: '②', text: '떡국을 끓이을 줄 알아요.' },
      { label: '③', text: '윷놀이를 하을 줄 알아요.' },
      { label: '④', text: '불고기를 만들을 줄 알아요.' }
    ],
    correctAnswer: '①',
    explanation: 'The correct ability expression form is 입을 줄 알아요.'
  },
  {
    questionNumber: 28,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '할아버지께 덕담을 빌었어요.' },
      { label: '②', text: '설날 아침에 떡국을 입었어요.' },
      { label: '③', text: '보름달을 보고 소원을 들었어요.' },
      { label: '④', text: '가족들하고 같이 차례를 지냈어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct verb for performing ancestral rites is 지냈어요.'
  },
  {
    questionNumber: 29,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '버스를 타서 회사에 출근해요.' },
      { label: '②', text: '술을 마셔서 운전할 줄 몰라요.' },
      { label: '③', text: '한국어를 배우려고 센터에 가세요.' },
      { label: '④', text: '박물관에 음식물을 반입할 수 없어요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct negative potential form is 반입할 수 없어요.'
  },
  {
    questionNumber: 30,
    questionText: '다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.',
    options: [
      { label: '①', text: '내일 9시까지 꼭 와면 돼요.' },
      { label: '②', text: '푸함 씨, 기분 나쁘지 마세요.' },
      { label: '③', text: '저는 내년에 재주도에 가 봤습니다.' },
      { label: '④', text: '자이 씨는 K-드라마를 자주 보는 것 같아요.' }
    ],
    correctAnswer: '④',
    explanation: 'The correct form expressing supposition is 보는 것 같아요.'
  }
];

// Connect to MongoDB and seed questions
const seedQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    // Check if questions already exist
    const existingQuestions = await Question.find({
      questionNumber: { $in: grammarQuestions.map(q => q.questionNumber) },
      type: 'reading'
    });

    if (existingQuestions.length > 0) {
      console.log(`⚠️  Found ${existingQuestions.length} existing questions with these numbers.`);
      console.log('Deleting existing questions before seeding...');
      await Question.deleteMany({
        questionNumber: { $in: grammarQuestions.map(q => q.questionNumber) },
        type: 'reading'
      });
    }

    // Add common fields to all questions
    const questionsToInsert = grammarQuestions.map(q => ({
      ...q,
      type: 'reading',
      difficulty: 'medium',
      topic: 'grammar',
      tags: ['grammar', 'sentence-correction', '문법'],
      isActive: true
    }));

    // Insert questions
    const result = await Question.insertMany(questionsToInsert);
    console.log(`✅ Successfully added ${result.length} grammar questions to the database!`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   Question numbers: ${grammarQuestions[0].questionNumber} - ${grammarQuestions[grammarQuestions.length - 1].questionNumber}`);
    console.log(`   Type: Reading (Grammar)`);
    console.log(`   Difficulty: Medium`);
    console.log(`   Topic: Grammar`);
    console.log(`   Total: ${result.length} questions`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
};

// Run the seed function
seedQuestions();
