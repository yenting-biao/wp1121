import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { db } from "@/db";
import { tweetsTable, likesTable } from "@/db/schema";

import { sql } from "drizzle-orm";
//import { start } from "repl";


// zod is a library that helps us validate data at runtime
// it's useful for validating data coming from the client,
// since typescript only validates data at compile time.
// zod's schema syntax is pretty intuitive,
// read more about zod here: https://zod.dev/
const postTweetRequestSchema = z.object({
  handle: z.string().min(1).max(50),
  content: z.string().min(1).max(280),
  replyToTweetId: z.number().optional(),
  startAt: z.string().optional(),
  finishAt: z.string().optional(), // TODO
});

// you can use z.infer to get the typescript type from a zod schema
type PostTweetRequest = z.infer<typeof postTweetRequestSchema>;

// This API handler file would be trigger by http requests to /api/likes
// POST requests would be handled by the POST function
// GET requests would be handled by the GET function
// etc.
// read more about Next.js API routes here:
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    // parse will throw an error if the data doesn't match the schema
    // if that happens, we return a 400 error
    postTweetRequestSchema.parse(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // the `data` variable is now guaranteed to be of type PostTweetRequest
  // but the compiler doesn't know that, so we have to cast it with `as`
  const{ handle, content, replyToTweetId, startAt, finishAt } = data as PostTweetRequest;
  const startDate = startAt ? new Date(startAt).toISOString().replace(/\.\d+/, '').replace('Z', '').replace('T', ' ') : undefined;
  //startDate = new Date(createdAt).toISOString();
  const endDate = finishAt ? new Date(finishAt).toISOString().replace(/\.\d+/, '').replace('Z', '').replace('T', ' ') : undefined;

  try {
    // This piece of code runs the following SQL query:
    // INSERT INTO tweets (
    //  user_handle,
    //  content,
    //  reply_to_tweet_id
    // ) VALUES (
    //  {handle},
    //  {content},
    //  {replyToTweetId}
    // )
    if(startDate && endDate){
      const insertResult = await db
      .insert(tweetsTable)
      .values({
        userHandle: handle,
        content: content,
        replyToTweetId: replyToTweetId,
        startAt: sql`to_timestamp(${startDate},'YYYY-MM-DD HH24:MI:SS')`,
        finishAt: sql`to_timestamp(${endDate},'YYYY-MM-DD HH24:MI:SS')`,
      })
      .returning({tweetID: tweetsTable.id})
      .execute();

      if (insertResult && insertResult[0] && insertResult[0].tweetID) {
        const id = insertResult[0].tweetID;
        console.log(id);
        
        // auto like the tweet user created
        await db
        .insert(likesTable)
        .values({
          tweetId: id,
          userHandle: handle,
        })
        .onConflictDoNothing()
        .execute();
        
        return NextResponse.json(
          { body: id},
          { status: 200 }
        );
      }else{
        return NextResponse.json(
          { error: "Something went wrong" },
          { status: 500 },
        );
      }
      
    }else{
      const insertResult = await db
      .insert(tweetsTable)
      .values({
        userHandle: handle,
        content: content,
        replyToTweetId: replyToTweetId,
      })
      .returning({tweetID: tweetsTable.id})
      .execute();

      let id;
      if (insertResult && insertResult[0] && insertResult[0].tweetID){
        id = insertResult[0].tweetID;
      }
      else{
        id = "";
      }
      return NextResponse.json(
        { body: id},
        { status: 200 }
      );
    }
    
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
