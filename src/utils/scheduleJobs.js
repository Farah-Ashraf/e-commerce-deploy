import schedule from 'node-schedule';
import { User } from "../../db/index.js";
import { status } from "./constant/enums.js";

export const scheduledJobs = () => {

    schedule.scheduleJob('1 1 1 * * *', async function(){
    
        const users = await User.find({ status: status.PENDING, createdAt: {$lte: Date.now() - 1 * 30 * 24 * 60 * 60 * 1000} }).lean(); //he created his account from a month but not verified then remove him (cron jobs)
        const usersIds = users.map( (user) => { return user._id } );
        await User.deleteMany( { _id: { $in: usersIds } } );
    
    });
    
    schedule.scheduleJob('1 1 1 * * *', async function(){  //this job is scheduled to run every day at 01:01:01 AM.
    
        const users = await User.find({ status: status.DELETED, updatedAt: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 }).lean(); //3 months ago
        const usersIds = users.map( (user) => { return user._id } );
        await User.deleteMany( { _id: { $in: usersIds } } );
     
    });
    
}
