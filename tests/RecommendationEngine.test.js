import { RecommendationEngine } from '../src/services/RecommendationEngine.js';

const catalog={a:{impact:'high',title:'A'},b:{impact:'low',title:'B'}};
const engine=new RecommendationEngine(catalog);

const result=engine.resolve(['b','a','missing']);

if(result.length!==2) throw new Error('Expected two recommendations');
if(result[0].id!=='a') throw new Error('High impact should be first');
console.log('RecommendationEngine tests passed');