import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotifications(tokens: string[], title: string, body: string, data: any = {}) {
    const messages: ExpoPushMessage[] = [];

    for (const token of tokens) {
        if (!Expo.isExpoPushToken(token)) {
            console.error(`Push token ${token} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(error);
        }
    }

    // In a real production app, we should also process the tickets to handle errors (e.g. invalid tokens)
    // For now, we just log them if needed.
    return tickets;
}
