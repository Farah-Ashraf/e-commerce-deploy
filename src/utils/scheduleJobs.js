import schedule from 'node-schedule';
import cloudinary from './cloudinary.js';
import { User } from "../../db/index.js";

export const scheduledJobs = () => {
    
    schedule.scheduleJob('1 1 1 * * *', async function(){  //this job is scheduled to run every day at 01:01:01 AM.
    
        const users = await User.find({ isDeleted: true, updatedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000} }).lean(); //3 months ago
        for (const user of users) {
            await cloudinary.uploader.destroy(user.image.publicId)
        }
        const usersIds = users.map( (user) => { return user._id } );
        await User.deleteMany( { _id: { $in: usersIds } } );
     
    });
    
}
