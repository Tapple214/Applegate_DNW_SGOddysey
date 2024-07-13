##  Instructions ##
### CM2040 Database Networks and the Web ###

#### Additional libraries ####

- Express session for sessions (authentication/authorization)
- Bootstrap for UI

#### To check/note - potential errors ####

* Package.json
    - Ensure that in "start": "node index.js", "start" is written instead of "nodemon"
    - This was already done prior to submission but in case the application do not run, this could be the reason
* Image upload
    - This can arise, during submission of the create article form/page
    - It is advised to use greet.png or main-accent.png as the image input as they are small enough to be submitted
    - In case of coming across this error, simply click your browser's back navigation button to be redirected back to the form page. Reupload the suggested images and re-submit.
* Improper logging out
    - You should see an error whereby you can see the "Write" in your navigation bar but upon clicking it, you see an error that looks like "Could not find blog_title" >> <%=blog.blog_title%>
    - In case of coming across this error, simply click your browser's back navigation button:
        - Press "SG Odyssey" (logo), join as an author and re-login
        - From the reader's main page, flip through the carousel and "Join our community" and re-login
* Blog set up
    - This is not an error but a note just in case
    - Once you are redirected to the "Set up your blog", this means that your account has already been added into the database
    - So in any case you redirect yourself out of the blog set up without completing that form, simply login with your account, and you will be redirected back to the blog set up page
    - Clicking "Sign up" with your registered account will give you an "Uh oh! Username already exists. Please choose another." error
       
#### Running this app ####

To get started:

* Run ```npm install``` from the project directory to install all the node packages.

* Run ```npm run build-db``` to create the database on Mac or Linux 
or run ```npm run build-db-win``` to create the database on Windows

* Run ```npm run start``` to start serving the web app (Access via http://localhost:3000)

Test the app by browsing to the following routes, these would list contents their respective tables:

* http://localhost:3000
* http://localhost:3000/list-authors 
* http://localhost:3000/list-blogs
* http://localhost:3000/list-articles
* http://localhost:3000/list-comments
* http://localhost:3000/list-feedback

You can also run: 
```npm run clean-db``` to delete the database on Mac or Linux before rebuilding it for a fresh start
```npm run clean-db-win``` to delete the database on Windows before rebuilding it for a fresh start


