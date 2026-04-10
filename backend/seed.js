const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('./models/user');

const mongoURI = "mongodb://127.0.0.1:27017/studentPortfolio";

const seedData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected for seeding...");

        const jsonPath = path.join(__dirname, '../frontend/src/students_mongodb.json');
        const studentsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        console.log(`Found ${studentsData.length} students to process.`);

        const hashedPassword = await bcrypt.hash('Siet@123', 10);
        let count = 0;

        for (const student of studentsData) {
            const registerNumber = student.register_number;
            if (!registerNumber) continue;

            const email = `${registerNumber}@siet.ac.in`.toLowerCase();

            const studentIndex = count + 1;
            let section = "A";
            if (studentIndex >= 63 && studentIndex <= 125) section = "B";
            else if (studentIndex >= 126 && studentIndex <= 188) section = "C";
            else if (studentIndex >= 189 && studentIndex <= 252) section = "D";


            const studentData = {
                fullName: student.name,
                email: email,
                password: hashedPassword,
                studentId: registerNumber,
                dob: student.dob,
                gender: student.gender,
                umisNumber: student.umis_number,
                cgpa: student.cgpa ? student.cgpa.toString() : "7.5",
                subjects: student.subjects || [],
                department: "Computer Science",
                section: section,
                role: 'student'
            };

            await User.findOneAndUpdate(
                { email },
                {
                    $setOnInsert: {
                        portfolio: {
                            isPublic: true,
                            profilePhoto: '',
                            bio: '',
                            skills: [],
                            achievements: [],
                            certificates: [],
                            projects: []
                        }
                    }, $set: studentData
                },
                { upsert: true, new: true }
            );
            count++;
            if (count % 20 === 0) console.log(`Processed ${count} students...`);
        }

        console.log(`Seeding complete! Added ${count} new students.`);
        process.exit();
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedData();
