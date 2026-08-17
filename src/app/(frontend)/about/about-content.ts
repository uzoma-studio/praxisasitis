export type WhatItem = { question: string; answer: string }
export type Quote = { text: string; attribution: string }
export type QuoteExplainBlock = {
  leadText?: string[]
  quote: Quote
  explanation: string[]
}

export type AboutData = {
  heading: string
  introText: string
  bodyText: string[]
  openingQuote: QuoteExplainBlock
  problemSection: {
    title: string
    introText: string[]
    panelTitle: string
    panelSubtitle: string
    items: WhatItem[]
    quote: Quote
    afterText: string[]
  }
  problemClosingQuote: QuoteExplainBlock
  whoWeAre: {
    title: string
    body: string[]
    quote: Quote
    afterText: string[]
    editor?: string
    institution?: string
    fundedBy?: string
  }
  collapsibleSections: { title: string; body: string[]; quote?: Quote }[]
  closingBanner: string
}

export const aboutContent: AboutData = {
  heading: 'About PraxisAsItIs',
  introText: 'We began this project with a simple observation.',
  bodyText: [
    'Nigerian movements, the ones that produced #EndSARS, #EndBadGovernance, and countless smaller acts of resistance are extraordinary at saying no. We can fill a street. We can trend a hashtag. We can make a government blink. But we are much less good at saying yes. We have not built a shared, vivid, compelling picture of what we are fighting for. And that imaginative gap has proven to be a political vulnerability. It allows a dictatorial state to fill the vacuum with fear, cynicism, and division. This is a vulnerability we must admit.',
  ],
  openingQuote: {
    quote: {
      text: 'Hide nothing from the masses of our people. Tell no lies. Expose lies whenever they are told. Mask no difficulties, mistakes, failures. Claim no easy victories.',
      attribution: 'Amílcar Cabral, Revolution in Guinea: Selected Texts',
    },
    explanation: [
      "These words are the spirit and the operating system of this website. We admit that vulnerability and the fact that shying away from that vulnerability has opened us up to more vulnerabilities, that this website also seeks to address. On this website, tell no lies means no heroic press releases, no sanitised victory narratives, no pretending that failure didn't happen. Claiming no easy victory means we refuse the seduction of the quick win, the hollow hashtag, the mobilisation that burns bright and leaves nothing behind.",
    ],
  },
  problemSection: {
    title: 'The Problem We Are Trying to Solve',
    introText: [
      'Movements learn. Or they should. But in Nigeria, movement learning is mostly invisible. It happens in WhatsApp groups that disappear, in chaotic debriefs after protests, in the heads of a few exhausted organisers who never get to write down what they learned before the next crisis hits. This lack of grounding has created a situation where we are sometimes chasing shadows and undertaking action for action sake. We have found that this is not sustainable.',
    ],
    panelTitle: 'What This Website Does',
    panelSubtitle: 'Every post on this site answers four questions',
    items: [
      {
        question: 'What did we do?',
        answer:
          'The action, described in concrete detail. Dates. Numbers. Locations. No abstraction.',
      },
      {
        question: 'What did we learn?',
        answer:
          'The hard‑won insight. What changed in our understanding of power, of our community, of ourselves.',
      },
      {
        question: 'What is still unclear?',
        answer: 'The honest admission of confusion. The question we cannot yet answer.',
      },
      {
        question: 'What do we need?',
        answer:
          'A request for help. A lawyer. A printer. A venue. Solidarity. Then we put a pin on the map. Anyone can zoom in, see what is happening in their neighbourhood, and/or learn from someone they have never met. This is where lived reality meets ideological learning.',
      },
    ],
    quote: {
      text: 'Many people lose energy and effort, and make sacrifices combating shadows. We have to combat the material reality that produces the shadow.',
      attribution: 'Amílcar Cabral, Return to the Source',
    },
    afterText: [
      'Without an honest archive of struggle, we end up fighting shadows like our own assumptions, our borrowed theories, and our recycled slogans, which can feel very comfortable sometimes. We often fail to see the actual shape of power: the rural chief who controls the police, the cruel landlord who knows the magistrate, or the market where their solidarity culture is stronger than any political party. PraxisAsItIs is a tool for seeing the material reality. It is a live, public, geospatial map of what people are actually doing, block by block, street by street, struggle by struggle.',
    ],
  },
  problemClosingQuote: {
    quote: {
      text: '“Hide nothing from the masses of our people. Tell no lies. Expose lies whenever they are told. Mask no difficulties, mistakes, failures. Claim no easy victories.”',
      attribution: 'Amílcar Cabral, Revolution in Guinea: Selected Texts',
    },
    explanation: [
      'These words are the spirit and the operating system of this website. We admit that vulnerability and the fact that shying away from that vulnerability has opened us up to more vulnerabilities, that this website also seeks to address. On this website, tell no lies means no heroic press releases, no sanitised victory narratives, no pretending that failure didn’t happen. Claiming no easy victory means we refuse the seduction of the quick win, the hollow hashtag, the mobilisation that burns bright and leaves nothing behind.',
    ],
  },
  whoWeAre: {
    title: 'Who We Are',
    body: [
      'PraxisAsItIs was initiated and will be edited by a researcher‑organiser (Omole Ibukun) in collaboration with a Movement Advisory Council (domiciled within the Movement Lab Collective) of trusted grassroots movement leaders. The initiation of this project was funded as one of the outputs of a research grant from the Open Society Foundation to the researcher-organiser to study Movement Learning in Nigeria. We, therefore, operate largely as a commons of movement intellectuals, and not as an NGO.',
    ],
    quote: {
      text: '[The revolutionary petty bourgeoisie] must be capable of committing suicide as a class, to be reborn as revolutionary workers, entirely identified with the deepest aspirations of the people to which they belong.',
      attribution: 'Amílcar Cabral, Recueil de textes',
    },
    afterText: [
      'This website is an attempt to practice what Cabral preached that intellectuals who wish to serve movements must dissolve their privilege, not translate it into a new form of authority. Therefore the editor is a scribe, not an expert. The map belongs to the people who put the pins on it. We do not intend to speak for the movement, but to provide the infrastructure for the movement to speak for itself.',
    ],
    editor: 'Omole Ibukun',
    institution: 'Movement Lab Collective',
    fundedBy: 'Open Society Foundation',
  },
  collapsibleSections: [
    {
      title: 'Why the Map Matters',
      body: [
        'A map is not neutral. To map a struggle is to declare that it exists, that it has a location, that it is connected to other struggles. To map struggles is to connect a rising culture of social change efforts across our geography.',
        'This map is, therefore, an act of culture. It refuses the erasure of grassroots organising. It refuses the story that only big events, big names, big NGOs matter. A market women’s cooperative fighting eviction in Ijora gets a pin. A student collective organising around hostel fees in UI gets a pin. A tenants’ union in Abuja gets a pin. All of them are visible. All of them are teachers. This is the rising of a new resistance culture that is not imported but based on the living reality of our environment.',
        'These upward paths are already there. They are the daily, unglamorous, exhausting acts of refusal and construction that never make the news. PraxisAsItIs is a tool for finding those paths, for walking them, and for marking them so others can follow.',
      ],
      quote: {
        text: 'If imperialist domination has the vital need to practice cultural oppression, national liberation is necessarily an act of culture.',
        attribution: 'Amílcar Cabral, "National Liberation and Culture"',
      },
    },
    {
      title: 'The Long View',
      body: [
        'We do not dismiss the mobilisation that peaks and collapses. We are interested in infrastructure, because that is the concrete reality that our urgent (but long) walk to freedom must be carried out upon.',
        'A website cannot replace a revolution, neither can a map replace a movement, but a movement without a shared memory, without a learning archive, without a way to see its own patterns across time and space is a movement that is destined to repeat its mistakes and exhaust its people. PraxisAsItIs is slow infrastructure. It is designed to outlast any single protest, any single leader, any single funding cycle. It is built to be forked, copied, adapted. Any group anywhere can take the code and run their own map.',
      ],
      quote: {
        text: 'We must walk rapidly but not run. We must not be opportunists, nor allow our enthusiasms to make us lose the vision of concrete reality.',
        attribution: 'Amílcar Cabral',
      },
    },
    {
      title: 'The Trap We Are Trying to Avoid',
      body: [
        'Cabral has warned us that the greatest danger is not defeat. It is winning and becoming the oppressor. While we prepare for a long walk to freedom, we also expect that we can win in our lifetime, and we do not want to replicate the nature of what we claim to be fighting.',
        'Movements that do not learn from their own practice are doomed to reproduce the hierarchies they fought against. The organiser who never reflects becomes the boss. The collective that never admits failure becomes a sect. The resistance that never imagines a future becomes a machine for recycling the past. PraxisAsItIs is our small, imperfect attempt to build a different kind of muscle - the muscle of honest reflection, of shared learning, of collective imagination. It is our way of returning our ideologies to our roots.',
        'We are not returning to a golden age. We are returning to the discipline of truth‑telling, the humility of not knowing, the courage of asking for help. That is the root. That is the need.',
      ],
      quote: {
        text: 'The problem of the nature of the state created after independence is perhaps the secret of the failure of African independence.',
        attribution: 'Amílcar Cabral',
      },
    },
    {
      title: 'Join Us',
      body: [
        'If you are an organiser—in a market, a campus, a union, a mosque, a street corner—write your story. Pin it on the map. Teach what you learned. Ask for what you need.',
        'If you are a researcher or a journalist, use the map. Cite the posts. Credit the authors. Do not extract.',
        'If you are a donor, fund the infrastructure, not the meetings. No branding. No editorial control. No quarterly reports that no one reads.',
        'If you are a citizen, zoom into your neighbourhood. See who is struggling. See who is organising. See that you are not alone. And join any of these efforts. Join the struggle, because it is conjoined to our human reality.',
      ],
      quote: {
        text: 'You know what struggle is. You have understood already that struggle is a normal condition of all realities in motion. In everything that moves, that exists, there is always a struggle.',
        attribution: 'Amílcar Cabral, "Not Everyone Is of the Party"',
      },
    },
  ],
  closingBanner: 'Tell No Lies, Claim No Easy Victory',
}
