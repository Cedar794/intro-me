import { games } from './games'

const categories = [
  { id: 'competitive', name: '竞技对抗', keys: ['honor', 'valorant', 'pubg', 'squad'] },
  { id: 'open-world', name: '开放世界与角色扮演', keys: ['cyberpunk', 'gta', 'witcher', 'hogwarts', 'rdr', 'spiderman'] },
  { id: 'survival', name: '沙盒建造与生存', keys: ['minecraft', 'terraria', 'forest', 'raft'] },
  { id: 'simulation', name: '模拟经营与运动', keys: ['stardew', 'cities', 'ets', 'xplane', 'steep'] },
  { id: 'cooperative', name: '合作冒险与派对', keys: ['ittakestwo', 'splitfiction', 'draw', 'human', 'overcooked', 'rv', 'pico'] },
  { id: 'interactive-story', name: '互动影游与视觉小说', keys: ['love-around', 'love-room', 'love-prequel', 'love-two', 'love-summer', 'true-love'] },
]

export const gameCategories = categories.map(category => ({
  id: `games-${category.id}`,
  name: category.name,
  games: category.keys.map(key => {
    const game = games.find(game => game[0] === key)
    if (!game) throw new Error(`Unknown categorized game: ${key}`)
    return game
  }),
}))
