
export const INITIAL = 'INITIAL';
export const LOST_MEMORY = 'LOST_MEMORY';
export const HERBS_NEARBY_FETCH_FLOWER = 'HERBS_NEARBY_FETCH_FLOWER';
export const FETCH_FLOWER_REPEAT = 'FETCH_FLOWER_REPEAT';
export const HERBS_NEARBY_FETCH_FLOWER_DONE = 'HERBS_NEARBY_FETCH_FLOWER_DONE';
export const TAKE_TORCH = 'TAKE_TORCH';


export const EldraDialogText = {
  [INITIAL]: `
    Oh my, what do we have here?
    You look like you've been through quite an ordeal.
    How did you end up on this shore?
  `,
  [LOST_MEMORY]: `
    Lost your memory, you say?
    That's quite a predicament.
    And hungry too, I see.
    Well, let's start with getting you something to eat.
  `,
  [HERBS_NEARBY_FETCH_FLOWER]: `
    I've got some herbs.
    Why don't you fetch me a flower?
    You should be able to find one just south of here.
    And I'll cook us up a nice meal.
  `,
  [FETCH_FLOWER_REPEAT]: `
    You should be able to find a flower just south of here.
  `,
  [HERBS_NEARBY_FETCH_FLOWER_DONE]: `
    How wonderful!  Give me a moment to prepare the meal.
  `,
  [TAKE_TORCH]: `
    While I prepare the meal,
    Why don't you take this torch
    and explore the cave to the east?
  `,
};

export const EldraDialogGraph = {
  [INITIAL]: {
    next: (state) => [LOST_MEMORY, state],
  },

  [LOST_MEMORY]: {
    next: (state) => [HERBS_NEARBY_FETCH_FLOWER, state],
  },

  [HERBS_NEARBY_FETCH_FLOWER]: {
    next: (state) => {
      const npcState = state.npcs.find(npc => npc.tile === 'N');
      if (state.inventory.f) {
        return [HERBS_NEARBY_FETCH_FLOWER_DONE, state];
      } else if (npcState.toldFetchFlower) {
        return [FETCH_FLOWER_REPEAT, state];
      } else {
        const newNpcs = state.npcs.map(npc => {
          if (npc.tile === 'N') {
            npc.toldFetchFlower = true;
          }
          console.log('updating npc', npc);
          return npc;
        });
        return [
          HERBS_NEARBY_FETCH_FLOWER,  // exit dialog
          { ...state, npcs: newNpcs },
        ];
      }
    }
  },

  [FETCH_FLOWER_REPEAT]: {
    next: (state) => {
      if (state.inventory.f) {
        return [HERBS_NEARBY_FETCH_FLOWER_DONE, state];
      } else {
        return [FETCH_FLOWER_REPEAT, state];
      }
    }
  },

  [HERBS_NEARBY_FETCH_FLOWER_DONE]: {
    next: state => {
      return [
        TAKE_TORCH,
        {
          ...state,
          inventory: {
            ...state.inventory,
            torch: true,
          },
        },
      ];
    }
  },
};
