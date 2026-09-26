
"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  ChevronDown,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type Language = "vi" | "en";

type AIAssistantProps = {
  language: Language;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE_VI =
  "Xin chào! Tôi là trợ lý của Huyen's. Tôi có thể giúp bạn tìm thông tin về khách sạn, phòng, tiện nghi, giá phòng và đặt phòng.";

const INITIAL_MESSAGE_EN =
  "Hello! I'm Huyen's assistant. I can help you find information about our hotels, rooms, amenities, room prices, and booking.";

const QUICK_QUESTIONS_VI = [
  "Có những khách sạn nào?",
  "Khách sạn nào có thang máy?",
  "Giá phòng hiện tại là bao nhiêu?",
  "Các khách sạn ở đâu?",
];

const QUICK_QUESTIONS_EN = [
  "Which hotels are available?",
  "Which hotels have an elevator?",
  "What are the current room prices?",
  "Where are the hotels located?",
];

export default function AIAssistant({
  language,
}: AIAssistantProps) {
  const isVi = language === "vi";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: isVi
        ? INITIAL_MESSAGE_VI
        : INITIAL_MESSAGE_EN,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMessages((current) => {
      if (
        current.length === 1 &&
        current[0].role === "assistant"
      ) {
        return [
          {
            role: "assistant",
            content: isVi
              ? INITIAL_MESSAGE_VI
              : INITIAL_MESSAGE_EN,
          },
        ];
      }

      return current;
    });
  }, [isVi]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  async function sendMessage(
    messageText: string
  ): Promise<void> {
    const text = messageText.trim();

    if (!text || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map(
        (item) => ({
          role: item.role,
          content: item.content,
        })
      );

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          language,
          history,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        console.error("AI API ERROR:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });

        const apiError =
          typeof data?.error === "string"
            ? data.error.trim()
            : "";

        throw new Error(
          apiError ||
            (isVi
              ? `Trợ lý AI gặp lỗi (${response.status}). Vui lòng thử lại.`
              : `The AI assistant encountered an error (${response.status}). Please try again.`)
        );
      }

      const answer =
        typeof data?.answer === "string"
          ? data.answer.trim()
          : "";

      if (!answer) {
        console.error(
          "AI API không trả về answer:",
          data
        );

        throw new Error(
          isVi
            ? "Trợ lý AI chưa trả về nội dung."
            : "The AI assistant returned no answer."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "";

      const fallbackMessage = isVi
        ? "Xin lỗi, hiện tại tôi chưa thể trả lời câu hỏi này. Vui lòng thử lại sau."
        : "Sorry, I cannot answer this question right now. Please try again later.";

      let displayMessage = errorMessage;

      if (
        !displayMessage ||
        displayMessage === "Failed to fetch"
      ) {
        displayMessage = fallbackMessage;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: displayMessage,
        },
      ]);
    } finally {
      setIsLoading(false);

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await sendMessage(input);
  }

  function handleQuickQuestion(
    question: string
  ) {
    if (isLoading) return;

    void sendMessage(question);
  }

  if (!mounted) {
    return null;
  }

  const quickQuestions = isVi
    ? QUICK_QUESTIONS_VI
    : QUICK_QUESTIONS_EN;

  const assistantUI = (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={
            isVi
              ? "Mở trợ lý AI"
              : "Open AI assistant"
          }
          className="
            fixed
            bottom-5
            right-5
            z-[9999]
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-blue-600
            text-white
            shadow-xl
            transition
            hover:scale-105
            hover:bg-blue-700
            active:scale-95
          "
        >
          <MessageCircle size={25} />

          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-white
              text-blue-600
              shadow
            "
          >
            <Sparkles size={12} />
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="
            fixed
            bottom-5
            right-5
            z-[9999]
            flex
            h-[min(700px,calc(100vh-40px))]
            w-[min(420px,calc(100vw-24px))]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-2xl
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              bg-blue-600
              px-4
              py-3
              text-white
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                "
              >
                <Bot size={23} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    Huyen's
                  </span>

                  <Sparkles size={14} />
                </div>

                <div className="text-xs text-blue-100">
                  {isVi
                    ? "Trợ lý thông tin lưu trú"
                    : "Stay information assistant"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={
                isVi
                  ? "Đóng trợ lý"
                  : "Close assistant"
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-white/10
              "
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-gray-50
              px-3
              py-4
            "
          >
            {messages.map((message, index) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`mb-3 flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div
                      className="
                        mr-2
                        mt-1
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-100
                        text-blue-600
                      "
                    >
                      <Bot size={17} />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[82%]
                      whitespace-pre-wrap
                      break-words
                      rounded-2xl
                      px-3.5
                      py-2.5
                      text-sm
                      leading-6
                      ${
                        isUser
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                      }
                    `}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="mb-3 flex justify-start">
                <div
                  className="
                    mr-2
                    mt-1
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-100
                    text-blue-600
                  "
                >
                  <Bot size={17} />
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    rounded-bl-md
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-500
                    shadow-sm
                  "
                >
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  <span>
                    {isVi
                      ? "Đang tìm thông tin..."
                      : "Finding information..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && !isLoading && (
            <div className="border-t bg-white px-3 py-3">
              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-gray-500
                "
              >
                <Sparkles size={13} />

                <span>
                  {isVi
                    ? "Câu hỏi gợi ý"
                    : "Suggested questions"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickQuestions.map(
                  (question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        handleQuickQuestion(
                          question
                        )
                      }
                      className="
                        rounded-full
                        border
                        border-gray-200
                        bg-gray-50
                        px-3
                        py-1.5
                        text-left
                        text-xs
                        text-gray-700
                        transition
                        hover:border-blue-300
                        hover:bg-blue-50
                        hover:text-blue-700
                      "
                    >
                      {question}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="
              border-t
              bg-white
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-3
                py-1.5
                transition
                focus-within:border-blue-400
                focus-within:bg-white
              "
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                disabled={isLoading}
                placeholder={
                  isVi
                    ? "Bạn muốn biết điều gì?"
                    : "What would you like to know?"
                }
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-2
                  text-sm
                  text-gray-800
                  outline-none
                  placeholder:text-gray-400
                "
              />

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !input.trim()
                }
                aria-label={
                  isVi
                    ? "Gửi câu hỏi"
                    : "Send question"
                }
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-600
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {isLoading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>

            <div
              className="
                mt-2
                flex
                items-center
                justify-center
                gap-1
                text-[10px]
                text-gray-400
              "
            >
              <span>
                {isVi
                  ? "Thông tin được lấy từ hệ thống Huyen's"
                  : "Information is retrieved from Huyen's system"}
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );

  return createPortal(
    assistantUI,
    document.body
  );
}
