import { games } from '../data/games'

export function GameProfile({ hidden }: { hidden: boolean }) {
  return (
    <main id="game-profile" className="game-profile" aria-label="Cedar 的游戏档案" hidden={hidden}>
      <header className="game-intro">
        <div className="game-intro-copy">
          <p className="game-eyebrow">CEDAR ZHANG / PLAYER PROFILE</p>
          <h1>游戏里的<br /><em>另一个我。</em></h1>
          <p className="game-intro-note">从红石世界到夜之城，从竞技对局到双人冒险。</p>
          <a className="steam-profile-link" href="https://steamcommunity.com/profiles/76561198818629528/" target="_blank" rel="noopener noreferrer">查看我的 Steam 主页 <span aria-hidden="true">↗</span></a>
          <div className="game-summary"><span><strong>26</strong>款游戏记录</span><span><strong>15 年</strong>我的世界玩家</span><span><strong>荣耀王者</strong>竞技与团队协作</span></div>
        </div>
        <div className="game-intro-art"><img src={`${import.meta.env.BASE_URL}assets/games/cyberpunk.jpg`} alt="赛博朋克 2077 官方游戏封面" width="460" height="215" /><div><span>NOW PLAYING</span><strong>赛博朋克 2077</strong><p>50–100 h · 二周目游玩中</p></div></div>
      </header>
      <div className="game-library-heading"><div><p className="game-eyebrow">THE COLLECTION</p><h2>我的游戏足迹</h2></div><span>26 GAMES / 按个人游玩记录整理</span></div>
      <div className="game-library">
        {games.map(([key, title, genre, time, note, source]) => (
          <a key={key} className="game-card" href={typeof source === 'number' ? `https://store.steampowered.com/app/${source}/` : source} target="_blank" rel="noopener noreferrer">
            <div className="game-cover"><img src={`${import.meta.env.BASE_URL}assets/games/${key}.jpg`} alt={`${title} 官方封面`} width="460" height="215" loading="lazy" /></div>
            <div className="game-card-meta"><span>{genre}</span><span>{time}</span></div>
            <h3>{title}</h3>
            {note && <p>{note}</p>}
          </a>
        ))}
      </div>
      <footer className="game-footer">游玩时长与经历由本人提供。游戏封面版权归各发行商所有；点击卡片可查看官方或 Steam 商店来源。</footer>
    </main>
  )
}
