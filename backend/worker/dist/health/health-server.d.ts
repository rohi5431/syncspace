import * as http from 'http';
import { WorkerService } from '../worker.service';
export declare function startHealthServer(workerService: WorkerService, port?: number): http.Server;
