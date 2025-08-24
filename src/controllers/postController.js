import * as postService from "../services/postService.js";

export async function createPost(call, callback) {
  try {
    const response = await postService.createPost(call.request);
    callback(null, response);
  } catch (err) {
    callback(err, null);
  }
}

export async function getTimeline(call, callback) {
  try {
    const response = await postService.getTimeline(call.request);
    callback(null, response);
  } catch (err) {
    callback(err, null);
  }
}
