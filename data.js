/* HypeCubs content: creatures, levels, story, hype lines, Body Lab facts.
   All original text. Units: s = seconds, r = times, st = steps, b = bars.
   each: true = do it on both sides (left then right). quiet = no-jump swap for Quiet mode. */
'use strict';

const STAGES = ['Cub', 'Scout', 'Ranger', 'Champion', 'Legend'];
const STAGE_COLOURS = ['#9aa3b5', '#5ed37a', '#4fb3ff', '#b58cff', '#ffc93c'];

const CREATURES = {
  bear: {
    name: 'Bear', builds: 'tummy, shoulders and coordination', colour: '#a0673a',
    levels: [
      { n: 'Bear hold', r: [5, 15], u: 's', c: 'Hands and feet on the floor, knees hovering just off the ground. Flat back like a table.' },
      { n: 'Bear crawl', r: [4, 10], u: 'st', c: 'Knees hovering, crawl forward. Right hand moves with left foot.' },
      { n: 'Bear there and back', r: [6, 14], u: 'st', c: 'Bear crawl forward, then backward the same number of steps.' },
      { n: 'Sideways bear', r: [4, 10], u: 'st', each: true, c: 'Bear crawl sideways like a sneaky bear. Go both ways.' },
      { n: 'Balancing bear', r: [6, 12], u: 'st', c: 'Put a soft toy on your back and bear crawl without dropping it.' }
    ]
  },
  gorilla: {
    name: 'Gorilla', builds: 'arms and chest for pushing', colour: '#5b6170',
    levels: [
      { n: 'Wall push-up', r: [5, 12], u: 'r', c: 'Hands on the wall, body straight like a plank. Nose comes close to the wall, then push away.' },
      { n: 'Sofa push-up', r: [5, 12], u: 'r', c: 'Hands on the edge of a sofa or sturdy table pushed against a wall. Body straight.' },
      { n: 'Knee push-up', r: [3, 10], u: 'r', c: 'Knees on the floor, body straight from head to knees. Chest down, push up.' },
      { n: 'Gorilla push-up', r: [1, 5], u: 'r', c: 'Full push-up on your toes. Body stays straight like a plank.' },
      { n: 'Mighty gorilla', r: [5, 10], u: 'r', c: 'Full push-ups, nice and slow on the way down.' }
    ]
  },
  kangaroo: {
    name: 'Kangaroo', builds: 'strong legs and strong bones', colour: '#d9894a',
    levels: [
      { n: 'Chair squat', r: [5, 12], u: 'r', c: 'Sit down on a chair and stand up again without using your hands.' },
      { n: 'Squat and hop', r: [4, 10], u: 'r', quiet: 'Slow squat with a 2-second pause at the bottom', c: 'Squat down, then do a small jump up. Land softly like a cat.' },
      { n: 'Bouncy hops', r: [6, 15], u: 'r', quiet: 'Tiptoe raises: up on your toes, slowly down', c: 'Two-foot hops on the spot. Soft knees when you land.' },
      { n: 'One-foot hops', r: [4, 10], u: 'r', each: true, quiet: 'One-leg mini squat, holding a chair', c: 'Hop on one foot, then the other. Hold something if you wobble.' },
      { n: 'Kangaroo bounds', r: [3, 8], u: 'r', quiet: 'Wall sit: back on the wall, knees bent, hold for the number in seconds', c: 'Big two-foot jumps forward, landing softly each time. Need space!' }
    ]
  },
  crab: {
    name: 'Crab', builds: 'back, bottom and shoulders', colour: '#e8534a',
    levels: [
      { n: 'Crab hold', r: [5, 15], u: 's', c: 'Sit, hands behind you, lift your tummy up to the sky. Hold it.' },
      { n: 'Crab walk', r: [4, 10], u: 'st', c: 'In crab position, walk forward on hands and feet.' },
      { n: 'Backwards crab', r: [4, 10], u: 'st', c: 'Crab walk backwards. Look over your shoulder so you don\'t bump into things.' },
      { n: 'Crab kicks', r: [4, 10], u: 'r', each: true, c: 'In crab position, kick one leg up, then the other.' },
      { n: 'Carrying crab', r: [6, 12], u: 'st', c: 'Balance a teddy or beanbag on your tummy and crab walk.' }
    ]
  },
  flamingo: {
    name: 'Flamingo', builds: 'balance, ankles and focus', colour: '#ff7eb6',
    levels: [
      { n: 'Flamingo stand', r: [10, 20], u: 's', each: true, c: 'Stand on one leg. Arms out if you need them. Then swap.' },
      { n: 'Long flamingo', r: [20, 40], u: 's', each: true, c: 'Stand on one leg for longer. Look at one spot to stay steady.' },
      { n: 'Wobbly flamingo', r: [10, 25], u: 's', each: true, c: 'Stand on one leg on a cushion. It wobbles. You don\'t.' },
      { n: 'Hop and stick', r: [3, 8], u: 'r', each: true, quiet: 'Clock reach: on one leg, touch the floor in front, to the side, then behind', c: 'Hop forward on one foot and freeze. No wobbles for 2 seconds.' },
      { n: 'Statue flamingo', r: [5, 15], u: 's', each: true, c: 'Stand on one leg with your eyes closed. Have a wall nearby.' }
    ]
  },
  monkey: {
    name: 'Monkey', builds: 'grip and pulling strength', colour: '#8a5a33', needsBar: true,
    levels: [
      { n: 'Monkey hang', r: [5, 15], u: 's', c: 'Grab the bar, arms straight, feet off the ground. Hang like a sleepy monkey.' },
      { n: 'Long hang', r: [15, 30], u: 's', c: 'Hang for longer. Breathe slowly. Get down carefully.' },
      { n: 'Swinging monkey', r: [4, 10], u: 'r', c: 'Hang and gently swing your legs forward and back.' },
      { n: 'Bar steps', r: [2, 4], u: 'b', c: 'On the monkey bars, cross bars one hand at a time.' },
      { n: 'Monkey legend', r: [5, 8], u: 'b', c: 'Cross the whole monkey bars, or go there and back.' }
    ],
    home: [
      { n: 'Superman hold', r: [5, 15], u: 's', c: 'Lie on your tummy. Lift your arms and legs off the floor like you\'re flying.' },
      { n: 'Long superman', r: [15, 30], u: 's', c: 'Fly for longer. Keep looking at the floor.' },
      { n: 'Towel tug', r: [10, 25], u: 's', c: 'You and a grown-up hold a towel. Pull steadily. No yanking!' },
      { n: 'Lizard Y-raise', r: [5, 10], u: 'r', c: 'Lie on your tummy, thumbs up. Lift your arms in a Y shape, then lower.' },
      { n: 'Floor legend', r: [10, 15], u: 'r', c: 'Y-raises with a 2-second hold at the top. Ask a grown-up to find you a bar at the park!' }
    ]
  }
};
const CREATURE_IDS = ['bear', 'gorilla', 'kangaroo', 'crab', 'flamingo', 'monkey'];
const UNIT = { s: 'seconds', r: 'times', st: 'steps', b: 'bars' };
const STEP = { s: 3, r: 1, st: 2, b: 1 };

/* ---------- Story: The Lost Forest ---------- */
const STORY = [
  { title: 'The Fading Fire', paths: ['The mossy path', 'The river stones'],
    text: 'The Great Campfire in the middle of the forest has nearly gone out. The forest animals are tired and grumpy. Your cub looks at you: "Will you help me bring the spark back?"' },
  { title: 'Footprints', paths: ['Follow the big prints', 'Follow the tiny prints'],
    text: 'You find footprints in the mud. Someone has been carrying sparks away from the fire! Your cub sniffs the air. "This way," it whispers.' },
  { title: 'The Wobbly Bridge', paths: ['Cross slowly', 'Cross quickly'],
    text: 'A rope bridge sways over a stream. Flamingo stands on one leg in the middle, calm as anything. "Balance comes from practice," she says, and waves you over.' },
  { title: 'Bear\'s Cave', paths: ['Knock politely', 'Sing a song'],
    text: 'Deep in the hills, Bear is guarding a tiny glowing spark. "I\'ll share it with anyone who can crawl like me," he rumbles. You get down on your hands and feet.' },
  { title: 'The Tall Trees', paths: ['Climb the oak', 'Climb the pine'],
    text: 'Monkey swings down from the branches. "The spark thief went up there!" Your hands feel stronger than last week. You reach for the first branch.' },
  { title: 'Kangaroo Meadow', paths: ['Hop the long way', 'Hop the short way'],
    text: 'Kangaroo is bouncing across the meadow collecting fallen sparks. "Every hop makes your bones stronger," she says. "Want to race?"' },
  { title: 'The Beach', paths: ['Search the rock pools', 'Search the sand'],
    text: 'Crab scuttles sideways along the sand. "I saw the thief! Wearing a cloak made of shadows." He points his claw towards the mountains.' },
  { title: 'Gorilla\'s Gate', paths: ['Push the left door', 'Push the right door'],
    text: 'A huge stone gate blocks the mountain path. Gorilla is pushing it, a little bit every day. "Strong isn\'t one big push," he says. "It\'s lots of little ones."' },
  { title: 'The Shadow Fox', paths: ['Speak to the fox', 'Watch the fox'],
    text: 'At the top of the mountain sits a small fox in a shadow cloak, holding all the sparks. It looks sad, not scary. "I just wanted to be warm," it says quietly.' },
  { title: 'A New Friend', paths: ['Invite the fox', 'Give the fox a spark'],
    text: 'Your cub has an idea. "The fire is big enough for everyone. You don\'t need to take sparks. Come and sit with us!" The fox\'s ears perk up.' },
  { title: 'The Return', paths: ['Take the river home', 'Take the hills home'],
    text: 'You all walk back together: Bear, Monkey, Kangaroo, Crab, Flamingo, Gorilla, the fox and your cub. Everyone carries a spark.' },
  { title: 'The Great Campfire', paths: ['Light it together', 'Let the fox light it'],
    text: 'Whoosh! The Great Campfire roars back to life, brighter than ever. Every animal cheers. Your cub grins at you: "We did it. And we got stronger doing it." The End of Season 1!' }
];

/* ---------- Hype engine: praise effort and strategy, never talent or looks ---------- */
const HYPE = {
  all: [
    'You kept going when it got hard. That\'s how strong gets built.',
    'Every single round! Your hard work is showing.',
    'You did all of it. Practice is paying off!',
    'Steady and strong. You took your time and got it done.',
    'That effort just made your muscles a tiny bit stronger.',
    'You stuck with it right to the end. Brilliant work!'
  ],
  some: [
    'Halfway is way further than zero. Your muscles noticed.',
    'You gave it a proper go. That counts.',
    'Some of it today means more of it soon. Keep practising!',
    'Good effort! Every try teaches your body something new.'
  ],
  tricky: [
    'Tricky means your body is learning. That\'s a good thing.',
    'You tried something hard. That takes guts.',
    'Not today? That\'s fine. Your body is getting ready.',
    'Hard things get easier with practice. You\'ll get there.'
  ],
  evolve: [
    'evolved! All those practice sessions did that.',
    'evolved! That\'s what practising week after week does.',
    'evolved! You earned that one, rep by rep.'
  ],
  brave: [
    'You tried a harder one. That was brave, whatever happened.',
    'Brave Try! Trying the next level is how legends start.',
    'You stepped up to a harder move. Brave!'
  ],
  done: [
    'Another log on the fire. The forest is getting brighter!',
    'You showed up and did the work. That\'s what counts.',
    'Your cub is doing a happy dance. Brilliant effort!'
  ]
};

/* ---------- Body Lab: what bodies can DO (never how they look) ---------- */
const BODY_LAB = {
  kangaroo: [
    'Jumping is like putting coins in your bone bank. Your bank keeps filling until you\'re about 20!',
    'When you land softly, your muscles work like springs to protect your knees.'
  ],
  monkey: [
    'Hanging trains the muscles in your hands and arms. You use the same ones to climb, carry and write.',
    'Your hands have over 30 muscles helping you grip. Hanging gives them all a workout.'
  ],
  bear: [
    'Bear crawls make your right arm and left leg work as a team. That helps you run, throw and catch.',
    'Your tummy muscles are like a belt that holds you steady when you move.'
  ],
  crab: [
    'Crab walks wake up the muscles on the back of your body that help you stand tall.',
    'Your shoulders are super-bendy joints. Crab moves help make them strong as well as bendy.'
  ],
  flamingo: [
    'Balance is a skill your brain learns. Your ears, eyes and feet all send it messages!',
    'Tiny muscles in your ankles make hundreds of little wobbles to keep you up. Practice makes them quicker.'
  ],
  gorilla: [
    'Push-ups use your chest, arms, shoulders and tummy all at once.',
    'Muscles get stronger by resting after hard work. That\'s why rest days matter too!'
  ]
};

/* ---------- Wiggle Break ---------- */
const WIGGLES = [
  { n: 'Star jumps', quiet: 'Star steps: step out wide and reach your arms up' },
  { n: 'Big arm circles' },
  { n: 'Shake it out: shake your hands, arms, legs, whole body' },
  { n: 'Tiptoe reach: stretch up to the ceiling' },
  { n: 'Marching on the spot, knees high' },
  { n: 'Frog squats: squat low, hands touch the floor, stand up' },
  { n: 'Robot moves: stiff arms and legs, beep boop' },
  { n: 'Tree pose: one foot on the other ankle, arms up like branches' }
];

/* ---------- Playground Quests ---------- */
const KIT = [
  { id: 'bars', n: 'Monkey bars' },
  { id: 'frame', n: 'Climbing frame' },
  { id: 'bench', n: 'Bench' },
  { id: 'steps', n: 'Steps or slide ladder' },
  { id: 'line', n: 'Painted line or kerb' },
  { id: 'grass', n: 'Open grass' }
];
const PARK_MOVES = {
  bars: ['Monkey hang: 10 seconds', 'Swing gently 5 times while hanging', 'Cross as many monkey bars as you can'],
  frame: ['Climb up and down the frame twice. Always keep 3 points touching (2 hands + 1 foot, or 2 feet + 1 hand)'],
  bench: ['Bench step-ups: 10 (swap your leading leg halfway)', 'Bench push-ups: 6, hands on the bench'],
  steps: ['Bunny hop up 3 steps, walk back down. Do it 3 times'],
  line: ['Flamingo walk: heel-to-toe along the line and back', 'Stand on one leg on the line for 10 seconds each side'],
  grass: ['Bear crawl 10 steps, then crab walk 10 steps', 'Kangaroo bounds: 5 big jumps', 'Roly-poly rolls or log rolls: 3']
};
