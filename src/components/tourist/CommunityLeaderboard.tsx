import React from 'react';
import {Trophy,ThumbsUp} from 'lucide-react';
import {usePlatform} from '../../services/journey';
import {contributorRanking} from '../../services/tourist';
import './tourist.css';
export function CommunityLeaderboard(){
 const {contributions,user}=usePlatform();const rows=contributorRanking(contributions);const mine=rows.find(r=>r.id===user?.id);const rank=mine?rows.filter(r=>r.upvotes>mine.upvotes).length+1:null;
 return <section className="tourist-leaderboard" aria-label="Community contributor leaderboard"><div className="tourist-section-title"><div><p className="tourist-eyebrow">The people behind better journeys</p><h2><Trophy size={22}/>Community champions</h2><p>Ranked by upvotes received from other travellers. Every helpful contribution counts.</p></div><div className="tourist-rank"><strong>{rank?`#${rank}`:'—'}</strong><small>Your rank · {mine?.upvotes||0} upvotes</small></div></div><div className="tourist-leader-stats"><span><strong>{rows.length}</strong> contributors</span><span><strong>{rows.reduce((s,r)=>s+r.upvotes,0)}</strong> upvotes</span><span><strong>{contributions.length}</strong> contributions</span></div>
 {!rows.length?<p className="tourist-empty">Be the first to share a local tip. Your name appears here when you contribute.</p>:<ol>{rows.slice(0,10).map(row=><li key={row.id} className={row.id===user?.id?'is-you':''}><span className="tourist-position">#{rows.filter(r=>r.upvotes>row.upvotes).length+1}</span><div><strong>{row.name}{row.id===user?.id?' (you)':''}</strong><small>{row.posts} contribution{row.posts===1?'':'s'}</small></div><span className="tourist-votes"><ThumbsUp size={15}/>{row.upvotes}<small>upvotes</small></span></li>)}</ol>}<p className="tourist-muted">All time · Equal upvote totals share a rank. Self-votes and repeated votes do not count.</p></section>;
}
