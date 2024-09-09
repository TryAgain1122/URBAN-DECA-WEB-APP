import React from "react";
import { RxAvatar } from "react-icons/rx";

const ListReviews = () => {
  return (
    <div className="w-1/2 mb-5 mt-7">
      <h3>3 Reviews</h3>
      <hr />
      <div className="my-3">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 lg:w-1/3 px-4">
            <div className="rounded-lg shadow-lg flex flex-row items-center gap-2">
              <RxAvatar size={30} />
              <div className="w-full lg:w-11/12">
                <div className="star-ratings">
                  <div>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star-half"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 flex flex-row items-center gap-2">
                <p className="font-light text-sm">by Raf</p>
                <p className="font-semibold text-lg">cfzxczxc</p>
            </div>
           
          </div>
        </div>
        <hr />
      </div>
    </div>
  );
};

export default ListReviews;
