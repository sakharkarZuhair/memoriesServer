import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
  const { page } = req.query;
  // console.log(page);

  try {
    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT; // get starting index of every page
    const total = await PostMessage.countDocuments({});
    // console.log("Limit:", LIMIT);
    // console.log("start-Index:", startIndex);
    // console.log("total:", total);

    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    // console.log(postMessages)
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  // console.log("Request Working: ", id);
  try {
    const post = await PostMessage.findById(id);
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

// QUERY --> /posts?page=1 --> page=1
// PARAMS --> /posts/:id(123) --> id --> 123

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  // console.log(req.query);
  try {
    const title = new RegExp(searchQuery, "i"); //new RegExp and "i" --> TEST, test, Test, TeSt all are equal to test -- i stands for ignorance
    const posts = await PostMessage.find({
      // $or means either this or that means if title search then show title alse tags & $in means tags is an array so inside tags
      $or: [{ title }, { tags: { $in: tags.split(",") } }], // we are getting tags like tags: "trend,2018" our backend needs in array so we are splitting and then we are getting tags: ["trend", "2018"]
    });
    res.json({ data: posts });
    // console.log(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error);
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  // console.log(post);
  // console.log(req.body.name);

  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;

  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that id");

  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    { ...post, _id },
    {
      new: true,
    }
  );

  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that id");

  await PostMessage.findByIdAndRemove(id);

  res.json({ message: "POST DELETED." });
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  // console.log(req.userId);
  // console.log(id);

  if (!req.userId) return res.json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that id");

  const post = await PostMessage.findById(id);

  const index = post.likes.findIndex((id) => id === String(req.userId));

  if (index === -1) {
    post.likes.push(req.userId);
    // console.log(post.likes, "Like");
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.userId));
    // !== this means filtering out current userId
    // console.log(post.likes, "disLike");
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatedPost);
};
