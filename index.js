const express = require('express');
const cors = require('cors');
const path = require('path');
const initMYSQL = require('./config/db');
const cookieParser = require('cookie-parser');

require('dotenv').config(); 
const port = process.env.port || 3000;

// API----------------------------------------------------------------------------------------------
// admin
const info = require('./api/admin/info');
const tools = require('./api/borrowReturn/tools');
const toolsHistory = require('./api/borrowReturn/toolsHistory');
const a_teams = require('./api/admin/teams');
const contact = require('./api/pages/contact');

// ,,, SignInUpOut
const SignIn = require('./api/SignInUpOut/SignIn');
const SignUp = require('./api/SignInUpOut/SignUp');
const SignOut = require('./api/SignInUpOut/SignOut');

// ... Student
// student
const stu_main = require('./api/student/Stu_Main');
const stu_showcase = require('./api/student/pages/Stu_Showcase');
const stu_showtiktok = require('./api/student/pages/Stu_ShowTiktok');

// ... selected
const selectedShowcase = require('./api/selected/selectedShowcase');
const selectedShowTiktok = require('./api/selected/selectedShowTiktok');

// --------------------------------------------------------------------------------------------------

const app = express();
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.get('/', (_, res) => {
    res.send('Hello Worlds!');
});

// API----------------------------------------------------------------------------------------------
// .... admin
app.use('/info', info);
app.use('/tools', tools);
app.use('/tools/history', toolsHistory);
app.use('/teams', a_teams);
app.use('/contact', contact);

// ,,, SignInUpOut
app.use('/SignIn', SignIn);
app.use('/SignUp', SignUp);
app.use('/SignOut', SignOut);

// ... student [ +admin ]
app.use('/student', stu_main);
app.use('/studentShowcase', stu_showcase);
app.use('/studentShowTiktok', stu_showtiktok);

// ... selected
app.use('/selectedShowcase', selectedShowcase);
app.use('/selectedShowTiktok', selectedShowTiktok);

// --------------------------------------------------------------------------------------------------

app.listen(port, async () => {
    try{
        await initMYSQL();
        console.log(`Example app listening at http://localhost:${port}`);

    } catch (err) {
        console.error('Error starting the app: ', err);
    }
});