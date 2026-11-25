/* AIFOREU Voice has one page: /voice/. This route of the product app only forwards to it. */
export default function VoiceMoved(){var l=location,s=l.search,g=(window.AiforeuLanguage&&window.AiforeuLanguage.language)||document.documentElement.lang;if(!/[?&]lang=/.test(s)&&g)s+=(s?"&":"?")+"lang="+encodeURIComponent(g);l.replace("/voice/"+s+l.hash);return null}
