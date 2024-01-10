export const emailTemplates = {
    VIDEO_LINK: (link: string, email: string, sourceEmail: string) => {
        const emailName = email.split('@')[0];
        const destinationName =
            emailName.charAt(0).toUpperCase() + emailName.slice(1);
        const appName = process.env.APP_NAME;
        return `
            <h2 style="color: #333;">${appName} - Notification</h2>

            <p>Dear ${destinationName},</p>

            <p>A user with email ${sourceEmail} recorded a cloud video and indicated your contact to send this message</p>

            <p><strong>Video Link:</strong> <a href="${link}">Click to download video</a></p>

            <p>This video will be available for downloading within 24 hours from the moment of recording.</p>

            <p>Please note that the content of this video is the sole responsibility of the user who recorded it. ${appName} does not assume any liability for the video's content accessible through the provided link.</p>

            <p>If you have any concerns or inquiries about this video, kindly contact the user who shared the link.</p>

            <p>Best regards,</p>
            <p>${appName}<br>
                This message generated automatically</p>
        `;
    },
};
