// import UserModel from '@/Model/user';
// import { getServerSession } from 'next-auth/next';
// import dbConnect from '@/lib/dbConnect';
// import { User } from 'next-auth';
// import { NextRequest } from 'next/server';
// import { authOptions } from '../../auth/[...nextauth]/options';

// export async function DELETE(
//   request: Request,
//   { params }: { params: { messageId: string } }
// ) {
//   const messageId = params.messageId;
//   await dbConnect();
//   const session = await getServerSession(authOptions);
//   const _user: User = session?.user;
//   if (!session || !_user) {
//     return Response.json(
//       { success: false, message: 'Not authenticated' },
//       { status: 401 }
//     );
//   }

//   try {
//     const updateResult = await UserModel.updateOne(
//       { _id: _user._id },
//       { $pull: { messages: { _id: messageId } } }
//     );

//     if (updateResult.modifiedCount === 0) {
//       return Response.json(
//         { message: 'Message  already deleted', success: true },
//         { status: 404 }
//       );
//     }

//     return Response.json(
//       { message: 'Message deleted', success: true },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error deleting message:', error);
//     return Response.json(
//       { message: 'Error deleting message', success: false },
//       { status: 500 }
//     );
//   }
// }


import UserModel from '@/Model/user';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options';

interface DeleteMessageParams {
  params: Promise<{ messageId: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: DeleteMessageParams
) {
  const { messageId } = await params; // ✅ Await the promise for params

  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user as User;

  // ✅ Authentication check
  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // ✅ Delete the message from user's messages array
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Message already deleted', success: true },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Message deleted successfully', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}
