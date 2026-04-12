const mongoose = require('mongoose');
const User = require('./backend/models/user');

const mongoURI = "mongodb://127.0.0.1:27017/studentPortfolio";

const checkUsers = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB...");
        
        const staffCount = await User.countDocuments({ role: 'staff' });
        console.log(`Staff count: ${staffCount}`);
        
        if (staffCount === 0) {
            console.log("No staff found. Creating a test staff user...");
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('Siet@123', 10);
            await User.create({
                fullName: "Ram Dev",
                email: "ramdev@siet.ac.in",
                password: hashedPassword,
                staffId: "STAFF001",
                role: 'staff',
                department: 'Computer Science'
            });
            console.log("Test staff user created: ramdev@siet.ac.in / Siet@123");
        } else {
            const staffMembers = await User.find({ role: 'staff' });
            staffMembers.forEach(s => console.log(`Staff: ${s.fullName} (${s.email})`));
        }
        
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkUsers();
