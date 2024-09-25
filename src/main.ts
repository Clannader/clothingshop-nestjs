/**
 * Create by oliver.wu 2022/4/10
 */
import parseEnv from '@/lib/parseEnv';
import { bootstrap } from './single.app';
import { clusterApp } from './cluster.app';

const clusterServer = parseEnv.read('clusterServer');
if (clusterServer === 'true') {
  clusterApp().then().finally();
} else {
  bootstrap().then().finally();
}
